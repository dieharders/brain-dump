'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { type Message, type CreateMessage } from 'ai/react'
import { I_ServiceApis } from '@/lib/homebrew'
import { I_InferenceGenerateOptions, I_LLM_Options } from '@/lib/hooks/types'


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
  const defaultSettings = {
    init: {},
    call: {},
  } as I_LLM_Options
  const [settings, setSettings] = useState(defaultSettings)
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const messages = useRef<Message[]>(initialMessages || [])
  const abortRef = useRef(false)

  const saveSettings = (settings: I_LLM_Options) => {
    setSettings(prev => {
      const result = { ...prev, ...settings }
      // Also persist to disk
      services?.storage.saveSettings({ body: settings })
      return result
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  const getCompletion = async (
    options: I_InferenceGenerateOptions,
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

    try {
      // Reset state
      setResponseText('')
      setIsLoading(true)
      abortRef.current = false
      // Send request completion for prompt
      console.log('[Chat] Sending request to inference server...', newUserMsg)
      const options = { ...settings.call, prompt: prompt.content }
      const response = await getCompletion(options, collectionNames)
      console.log('[Chat] Prompt response', response)
      if (!response) throw new Error('No prompt response.')

      // Process the stream into text tokens
      await processSseStream(
        response,
        settings?.call?.stop,
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

  // Load inference settings
  useEffect(() => {
    const action = async () => {
      const loadedSettings = await services?.storage.getSettings()
      setSettings(loadedSettings?.data)
    }
    action()
  }, [services?.storage])


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
    settings,
    saveSettings,
  }
}
