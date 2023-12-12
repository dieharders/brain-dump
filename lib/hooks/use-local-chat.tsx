'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { type Message, type CreateMessage } from 'ai/react'
import { ModelID } from '@/components/features/settings/types'
import { I_ServiceApis } from '@/lib/homebrew'

interface CompletionOptions {
  // messages: Message[]
  prompt: string
  stream?: boolean
  temperature?: number
  num_outputs?: number
  max_tokens?: number
  stop?: string[]
  echo?: boolean
  model?: ModelID
  seed?: number
  mode?: string
}

interface IProps {
  initialMessages: Message[] | undefined,
  services: I_ServiceApis | null
}

export const useLocalInference = ({
  initialMessages = [],
  services,
}: IProps) => {
  const { processSseStream } = useChatHelpers()
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const messages = useRef<Message[]>(initialMessages || [])
  const abortRef = useRef(false)

  // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  const getCompletion = async (
    options: CompletionOptions,
    collectionNames?: string[],
  ) => {
    try {
      return services?.textInference.inference({ body: { ...options, collectionNames } })
    } catch (error) {
      toast.error(`Prompt completion error: ${error}`)
      return
    }
  }

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

  const append = async (prompt: Message | CreateMessage, collectionNames?: string[]) => {
    if (!prompt) return

    setResponseId(nanoid())
    // Create new message for user's prompt
    const newUserMsg: Message = {
      id: prompt.id || nanoid(),
      role: prompt.role || 'user',
      content: prompt.content, // always assign prompt content w/o template
    }
    messages.current = [...messages.current, newUserMsg]
    // @TODO Pass some options from the user.
    const options: CompletionOptions = {
      prompt: prompt.content,
      stop: [
        '\n',
        '###',
        '[DONE]',
        'stop',
      ],
      stream: true,
      echo: true,
      max_tokens: 1024,
      temperature: 0.79, // 1.0 more accurate, 0.0 more creative
      seed: 0, // 0=random
      // top_p: 0.7,
      // suffix: '', // A suffix to append to the generated text. If None, no suffix is appended. Useful for chatbots.
      // presence_penalty: [1.0],
      // frequency_penalty: [1.0],
      // num_outputs: 1,
      // model: 'local', // renames model alias
      // llama.cpp specific
      // repeat_penalty: 1.0,
      // top_k: 1.0,
    }

    try {
      // Reset state
      setResponseText('')
      setIsLoading(true)
      abortRef.current = false
      // Send request completion for prompt
      console.log('[Chat] Sending request to inference server...', newUserMsg)
      const response = await getCompletion(options, collectionNames)
      console.log('[Chat] Prompt response', response)
      if (!response) throw new Error('No prompt response.')

      // Process the stream into text tokens
      await processSseStream(
        response,
        options.stop,
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
  }

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
