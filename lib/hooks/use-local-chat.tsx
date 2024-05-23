import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDate, nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { useGlobalContext } from '@/contexts'
import { DEFAULT_CONVERSATION_MODE, I_InferenceGenerateOptions, I_Message, I_Text_Settings } from '@/lib/homebrew'

interface IProps {
  initialMessages: I_Message[] | undefined
  settings?: I_Text_Settings
}

export const useLocalInference = (props: IProps) => {
  const {
    initialMessages = [],
    settings,
  } = props
  const { services, setIsAiThinking: setIsLoading, currentThreadId, setCurrentThreadId, threads, currentModel } = useGlobalContext() // @TODO maybe keep currentThreadId and threads in this hook ?
  const { processSseStream } = useChatHelpers()
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const messages = useRef<I_Message[]>(initialMessages || [])
  const abortRef = useRef(false)
  const index = useRef(messages.current?.findIndex(msg => msg?.id === responseId))
  const currThread = useRef(threads.find(v => v.id === currentThreadId))

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

  const onNonStreamResult = useCallback((result: string) => {
    setResponseText(result)
    console.log('[Chat] non-stream finished!')
    setIsLoading(false)
    return
  }, [setIsLoading])

  const onStreamResult = useCallback(async (result: string) => {
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
  }, [])

  const onStreamEvent = (eventName: string) => {
    // @TODO Render these states on screen, display in the prompt since it is disabled
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
  }, [setIsLoading])

  const append = useCallback(async (prompt: I_Message) => {
    if (!prompt) return

    // Create an id for the assistant's response
    setResponseId(nanoid())
    // Create new message for user's prompt
    const newUserMsg: I_Message = {
      id: prompt.id,
      role: prompt.role,
      content: prompt.content, // always assign prompt content w/o template
      createdAt: prompt.createdAt,
      order: prompt.order,
      ...(prompt.role === 'user' && { username: prompt?.username || '' }),
      ...(prompt.role === 'assistant' && { modelId: prompt?.modelId || '' }),
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

      // Check failure
      if (!response) throw new Error('No response.')
      if (typeof response.ok === 'boolean' && !response.ok) throw new Error(response.statusText)
      if (typeof response.success === 'boolean' && !response.success) throw new Error(response.message)

      // Check success if streamed
      if (response?.body?.getReader && response?.ok) {
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
      }

      // Check success if not streamed (chatbot)
      if (typeof response?.response === 'string') {
        onNonStreamResult(response?.response)
        return response?.response
      }

      // Check success if not streamed (playground)
      if (typeof response?.text === 'string') {
        onNonStreamResult(response?.text)
        return response?.text
      }
    } catch (err) {
      setIsLoading(false)
      toast.error(`Prompt request error: \n ${err}`)
      return null
    }
  }, [getCompletion, onNonStreamResult, onStreamResult, processSseStream, services, setIsLoading, settings])

  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      // Reset state
      setResponseText('')
      abortRef.current = false
      // Get last user prompt
      const userMessages = messages.current.filter(m => m.role === 'user')
      const text = userMessages?.[userMessages.length - 1].content
      // Delete prev assistant and user responses
      const len = messages.current.length - 1
      if (len > 0) messages.current = messages.current.slice(0, -2)
      // Resend with previous user prompt
      const res = await append({
        id: nanoid(),
        content: text,
        role: 'user',
        createdAt: formatDate(new Date()),
        order: messages.current?.length,
        username: '', // @TODO acct username
      })
      setIsLoading(false)
      // Return result
      return res
    } catch (error) {
      setIsLoading(false)
      return null
    }
  }, [append, setIsLoading])

  const saveThread = useCallback(async () => {
    if (messages.current?.length === 2 && !currThread.current) {
      // Create new thread
      const newThreadId = nanoid()
      setCurrentThreadId(newThreadId)
      services?.storage.saveChatThread({
        body: {
          threadId: newThreadId,
          thread: {
            id: newThreadId,
            createdAt: formatDate(new Date()),
            title: messages.current?.[0].content.slice(0, 36) || '',
            summary: '',
            numMessages: messages.current?.length || 0,
            messages: messages.current,
          },
        }
      })
    } else if (messages.current?.length >= 4 && currThread.current) {
      // Save new messages to disk
      services?.storage.saveChatThread({
        body: {
          threadId: currThread.current.id,
          thread: {
            ...currThread.current,
            messages: messages.current,
            numMessages: messages.current?.length || 0,
          },
        }
      })
    }
  }, [services?.storage, setCurrentThreadId])

  // Update messages with assistant's response
  useEffect(() => {
    if (index.current === -1 && responseId) {
      if (!responseText) {
        // Add new message
        const msg: I_Message = {
          id: responseId,
          role: 'assistant',
          content: responseText,
          createdAt: formatDate(new Date()),
          modelId: currentModel?.modelId || '',
          order: messages.current?.length,
        }
        messages.current = [...messages.current, msg]
      } else {
        // Update messages
        const newMsgs = [...messages.current]
        const msg = newMsgs?.find(m => m?.id === responseId)
        if (msg) {
          msg.content = responseText
          messages.current = newMsgs
        }
      }
    }
  }, [currentModel, responseId, responseText])

  // Reset state
  useEffect(() => {
    return () => {
      setCurrentThreadId('')
    }
  }, [setCurrentThreadId])

  return {
    messages: messages.current,
    append,
    reload,
    stop,
    saveThread,
  }
}
