import { useCallback, useEffect, useRef, useState } from 'react'
import { nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { type Message, type CreateMessage } from 'ai/react'
import { useGlobalContext } from '@/contexts'
import { DEFAULT_CONVERSATION_MODE, I_InferenceGenerateOptions, I_NonStreamCompletionResponse, I_Text_Settings } from '@/lib/homebrew'

interface IProps {
  initialMessages: Message[] | undefined
  settings?: I_Text_Settings
}

export const useLocalInference = (props: IProps) => {
  const {
    initialMessages = [],
    settings,
  } = props
  const { services } = useGlobalContext()
  const { processSseStream } = useChatHelpers()
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const messages = useRef<Message[]>(initialMessages || [])
  const abortRef = useRef(false)

  // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  const getCompletion = useCallback(async (
    options: I_InferenceGenerateOptions,
  ) => {
    try {
      return services?.textInference.inference({ body: options })
    } catch (error) {
      toast.error(`Prompt completion error: ${error}`)
      return
    }
  }, [services?.textInference])

  const onNonStreamResult = useCallback((result: I_NonStreamCompletionResponse) => {
    setResponseText(result.response)
    console.log('[Chat] non-stream finished!')
    setIsLoading(false)
    return
  }, [])

  const onStreamResult = async (result: string) => {
    try {
      // This is how the llama-cpp-python-server sends back data...
      // const parsedResult = JSON.parse(result)
      // const text = parsedResult?.choices?.[0]?.text

      // How Homebrew server sends data
      const parsedResult = result ? JSON.parse(result) : null
      const text = parsedResult?.data

      setResponseText(prevText => {
        return (prevText += text)
      })

      return
    } catch (err) {
      console.log('[Chat] onStreamResult err:', typeof result, ' | ', err)
      return
    }
  }

  const onStreamEvent = (eventName: string) => {
    // @TODO Render these states on screen
    switch (eventName) {
      case 'FEEDING_PROMPT':
        break
      case 'GENERATING_TOKENS':
        break
      default:
        break
    }
    console.log(`[Chat] onStreamEvent ${eventName}`)
  }

  const stop = useCallback(() => {
    // Reset state
    setIsLoading(false)
    abortRef.current = true
  }, [])

  const reload = useCallback(async () => {
    try {
      // Reset state
      setIsLoading(true)
      setResponseText('')
      abortRef.current = false
      // @TODO Delete prev assistant response
      const res = await Promise.resolve('') // @TODO implement, re-call append() with new prompt
      setIsLoading(false)
      return res
    } catch (error) {
      setIsLoading(false)
      return null
    }
  }, [])

  const append = useCallback(async (prompt: Message | CreateMessage) => {
    if (!prompt) return

    setResponseId(nanoid())
    // Create new message for user's prompt
    const newUserMsg: Message = {
      id: prompt.id || nanoid(),
      role: prompt.role || 'user',
      content: prompt.content, // always assign prompt content w/o template
    }
    messages.current = [...messages.current, newUserMsg]

    try {
      // Reset state
      setResponseText('')
      setIsLoading(true)
      abortRef.current = false

      // Get model data
      const model_configs = await services?.textInference.getModelConfigs()
      const current_text_model = await services?.textInference.model()
      const current_text_model_id = current_text_model?.data?.modelId || ''
      const messageFormat = model_configs?.data?.[current_text_model_id]?.messageFormat

      // Send request completion for prompt
      console.log('[Chat] Sending request to inference server...', newUserMsg)
      const mode = settings?.attention?.mode || DEFAULT_CONVERSATION_MODE
      const options: I_InferenceGenerateOptions = {
        mode,
        messageFormat,
        collectionNames: settings?.knowledge?.index,
        prompt: prompt?.content,
        promptTemplate: settings?.prompt?.promptTemplate?.text,
        ragPromptTemplate: settings?.prompt?.ragTemplate,
        systemMessage: settings?.system?.systemMessage,
        ...settings?.prompt?.ragMode,
        ...settings?.performance,
        ...settings?.response,
      }
      const response = await getCompletion(options)
      console.log('[Chat] Prompt response', response)

      // Check success if not streamed
      if (typeof response?.response === 'string') {
        onNonStreamResult(response)
        return
      }

      // Check success if streamed
      if (typeof response?.success === 'boolean')
        if (!response?.success) throw new Error('Response failed.')
      if (!response) throw new Error('No response.')

      // Process the stream into text tokens
      await processSseStream(
        response,
        settings?.response?.stop,
        {
          onData: (res: string) => onStreamResult(res),
          onFinish: async () => {
            console.log('[Chat] stream finished!')
            setIsLoading(false)
          },
          onEvent: async str => {
            onStreamEvent(str)
          },
          onComment: async str => {
            console.log('[Chat] onComment', str)
          },
        },
        abortRef,
      )
    } catch (err) {
      setIsLoading(false)
      toast.error(`Prompt request error: \n ${err}`)
      return null
    }
  }, [getCompletion, onNonStreamResult, processSseStream, services?.textInference, settings])

  // Update messages state with results
  useEffect(() => {
    // add new message
    const index = messages.current?.findIndex(msg => {
      return msg?.id === responseId
    })
    if (index === -1 && responseId) {
      const msg: Message = {
        id: responseId,
        role: 'assistant',
        content: responseText,
      }
      messages.current = [...messages.current, msg]
    }
    // update messages
    const newMessages = [...messages.current]
    const res = newMessages?.[index]
    if (res) {
      res.content = responseText
      messages.current = newMessages
    }
  }, [responseId, responseText])

  return {
    messages: messages.current,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput,
  }
}
