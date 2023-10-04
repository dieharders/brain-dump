'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { type Message, type CreateMessage } from 'ai/react'
import { ModelID } from '@/components/features/settings/types'

interface CompletionOptions {
  temperature?: number
  numOutputs?: number
  maxTokens?: number
  stopSequences?: string[]
  model?: ModelID
}

export const useLocalInference = ({
  initialMessages = [],
}: {
  initialMessages: Message[] | undefined
}) => {
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
  ): Promise<Response | undefined> => {
    // @TODO Pass a completions() func here from useHomebrew hook's api object
    const ip = 'http://localhost:8000/completions'
    try {
      const response = await fetch(ip, {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(options),
      })
      if (response.ok === true) {
        return response
      } else {
        toast.error(`Prompt completion error: ${response.statusText}`)
        return
      }
    } catch (error) {
      toast.error(`${error}`)
      return
    }
  }

  const onStreamResult = async (result: string) => {
    const parsedResult = JSON.parse(result)
    const text = parsedResult?.choices?.[0]?.text

    setResponseText(prevText => {
      return (prevText += text)
    })
    return
  }

  const onStreamEvent = (eventName: string) => {
    // @TODO Render these states on screen
    switch (eventName) {
      case 'FEEDING_PROMPT':
        console.log('@@ onEvent FEEDING_PROMPT...')
        break
      case 'GENERATING_TOKENS':
        console.log('@@ onEvent GENERATING_TOKENS...')
        break
      default:
        break
    }
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
      const foo = await Promise.resolve('') // @TODO implement, re-call append() with new prompt
      setIsLoading(false)
      return foo
    } catch (error) {
      setIsLoading(false)
      return null
    }
  }, [])

  const append = async (prompt: Message | CreateMessage) => {
    if (!prompt) return
    setResponseId(nanoid())

    const options = {
      stream: true,
      prompt: prompt.content,
      messages: [...messages.current, { role: 'user', content: prompt.content }],
      temperature: 1.0,
      numOutputs: 1,
      // seed: 99, // needs support from local.ai server
      // maxTokens: 2048,
      // model: 'local', // ModelID
      stopSequences: ['[DONE]'],
    }

    try {
      // Reset state
      setResponseText('')
      setIsLoading(true)
      abortRef.current = false
      // Create new message for user's prompt
      const newUserMsg: Message = {
        id: prompt.id || nanoid(),
        role: prompt.role,
        content: prompt.content,
      }
      console.log('@@ sending request to inference server...', newUserMsg)
      messages.current = [...messages.current, newUserMsg]
      // Request completion for prompt
      const response = await getCompletion(options)
      // Process the stream into text tokens
      if (!response) return
      await processSseStream(
        response,
        options.stopSequences,
        {
          onData: (res: string) => onStreamResult(res),
          onFinish: async () => {
            console.log('@@ stream finished!')
            setIsLoading(false)
          },
          onEvent: async str => {
            onStreamEvent(str)
          },
          onComment: async str => {
            // @TODO Render this state on screen
            console.log('@@ onComment', str)
          },
        },
        abortRef,
      )
    } catch (err) {
      setIsLoading(false)
      toast.error(`Prompt request error${err}`)
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
