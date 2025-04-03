import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDate, nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { useGlobalContext } from '@/contexts'
import { DEFAULT_CONVERSATION_MODE, I_InferenceGenerateOptions, I_Message, I_Text_Settings, I_Thread } from '@/lib/homebrew'
import { Session } from 'next-auth/types'

export interface I_Session extends Session {
  user: {
    id: string
    email: string
    exp: number
    iat: number
    jti: string
    name: string
    sub: string
    image?: string
  }
}

interface IProps {
  settings?: I_Text_Settings | null
  session: I_Session
}

export const useLocalInference = (props: IProps) => {
  const { settings, session } = props
  const { services, isAiThinking: isLoading, setIsAiThinking: setIsLoading, currentThreadId, threads, setThreads, currentModel, currentMessages, setCurrentMessages } = useGlobalContext()
  const { processSseStream } = useChatHelpers()
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const abortRef = useRef(false)
  const controller = useRef<AbortController>()
  const currThread = threads.find(v => v.id === currentThreadId.current)
  const currChatIndex = currentMessages?.findIndex(msg => msg?.id === responseId) || -1

  // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
  const getCompletion = useCallback(async (
    options: I_InferenceGenerateOptions,
  ) => {
    controller.current = new AbortController()
    try {
      return services?.textInference.generate({ body: options, signal: controller.current.signal })
    } catch (error) {
      toast.error(`Prompt completion error: ${error}`)
      return
    }
  }, [services?.textInference])

  const onNonStreamResult = useCallback((result: any) => {
    console.log('[Chat] non-stream finished!')
    result?.text && setResponseText(result?.text)
  }, [])

  const onStreamResult = useCallback(async (result: string) => {
    try {
      // Server sends data back
      const parsedResult = result ? JSON.parse(result) : null
      const data = parsedResult?.data
      const eventName = parsedResult?.event
      const text = data?.text
      if (text)
        setResponseText(prevText => {
          // Overwrite prev response if final content is received
          if (eventName === 'GENERATING_CONTENT') return text
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
      case 'GENERATING_CONTENT':
        break
      default:
        break
    }
    console.log(`[Chat] onStreamEvent ${eventName}`)
  }

  // Save threads to disk
  const saveThreads = useCallback(async (threadsData: I_Thread[]) => {
    const threadData = threadsData.find(t => t.id === currentThreadId.current)
    const messagesData = threadData?.messages
    if (!messagesData) return
    // Save new thread
    if (messagesData?.length === 2) {
      services?.storage.saveChatThread({
        body: {
          threadId: currentThreadId.current,
          thread: threadData,
        }
      })
      return
    }
    // Save new messages to thread
    if (messagesData?.length >= 4) {
      services?.storage.saveChatThread({
        body: {
          threadId: threadData?.id,
          thread: {
            ...threadData,
            messages: messagesData,
            numMessages: messagesData?.length || 0,
          },
        }
      })
      return
    }
  }, [currentThreadId, services?.storage])

  const stop = useCallback(() => {
    // Save response
    setThreads(prev => {
      saveThreads(prev)
      return prev
    })
    // Reset state
    setIsLoading(false)
    abortRef.current = true
    services?.textInference.stop()
    // Not currently used, but could be used to disconnect from initial request.
    // controller.current && controller.current.abort()
  }, [saveThreads, services?.textInference, setIsLoading, setThreads])

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
      ...(prompt.role === 'user' && { username: prompt?.username || '' }),
      ...(prompt.role === 'assistant' && { modelId: prompt?.modelId || '' }),
    }
    // Add to/Update messages list
    setCurrentMessages(prev => {
      if (!currentThreadId.current) {
        return [newUserMsg]
      }
      return [...prev, newUserMsg]
    })
    // Create new thread
    setThreads(prev => {
      if (!currentThreadId.current) {
        const newThreadId = nanoid()
        const newThread = {
          id: newThreadId,
          title: newUserMsg.content.slice(0, 36) || '',
          createdAt: formatDate(new Date()),
          summary: '', // @TODO fill in with Ai or let user edit
          numMessages: 1,
          userId: session?.user?.id || session?.user?.sub || '', // ids come as "sub" when using jwtoken
          messages: [newUserMsg],
          // sharePath: `/thread?id=${newThreadId}`, // this is added later when user allows sharing
        } as I_Thread
        currentThreadId.current = newThreadId
        return [newThread]
      }
      return prev
    })
    // Request response
    try {
      // Reset state
      setResponseText('')
      setIsLoading(true)
      abortRef.current = false

      // Send request completion for prompt
      console.log('[Chat] Sending request to inference server...', newUserMsg)
      const mode = settings?.attention?.response_mode || DEFAULT_CONVERSATION_MODE
      const options: I_InferenceGenerateOptions = {
        responseMode: mode,
        toolResponseMode: settings?.attention?.tool_response_mode,
        toolUseMode: settings?.attention?.tool_use_mode,
        tools: settings?.tools?.assigned,
        prompt: prompt?.content,
        promptTemplate: settings?.prompt?.promptTemplate?.text,
        systemMessage: settings?.system?.systemMessage,
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
      if (response?.body?.getReader) {
        // Process the stream into text tokens
        await processSseStream(
          response,
          {
            onData: (res: string) => onStreamResult(res),
            onFinish: async () => {
              console.log('[Chat] stream finished!')
              return
            },
            onEvent: async str => onStreamEvent(str),
            onComment: async str => {
              console.log('[Chat] onComment', str)
              return
            },
          },
          abortRef,
        )
      }

      // Check success if not streamed
      else onNonStreamResult(response)

      // Save final results
      setCurrentMessages(prevMsgs => {
        setThreads(prevThreads => {
          const newData = prevThreads.map(t => {
            if (t.id === currentThreadId.current) t.messages = prevMsgs
            return t
          })
          saveThreads(newData)
          return newData
        })
        return prevMsgs
      })
      // Finish
      setIsLoading(false)
      return
    } catch (err) {
      setIsLoading(false)
      toast.error(`Prompt request error: \n ${err}`)
    }
  }, [saveThreads, setThreads, setCurrentMessages, currentThreadId, getCompletion, onNonStreamResult, onStreamResult, processSseStream, setIsLoading, settings, session.user.id, session.user.sub])

  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      // Reset state
      setResponseText('')
      abortRef.current = false
      // Get last user prompt
      const userMessages = currThread?.messages.filter(m => m.role === 'user')
      const text = userMessages?.[userMessages.length - 1].content
      if (!text) return
      // Delete prev assistant and user responses
      setCurrentMessages(prevMessages => {
        // remove last msg
        const newMessages = prevMessages.slice(0, -2)
        return newMessages
      })
      // Resend with previous user prompt
      await append({
        id: nanoid(),
        content: text,
        role: 'user',
        createdAt: formatDate(new Date()),
        username: session?.user.name || '',
      })
    } catch (error) {
      setIsLoading(false)
    }
    return null
  }, [setIsLoading, currThread?.messages, append, session?.user.name, setCurrentMessages])

  // Update messages with assistant's response
  useEffect(() => {
    if (!isLoading && !responseText) return
    // Update message with response
    if (!isLoading && responseText) {
      setCurrentMessages(prev => prev.map(m => {
        if (m.id === responseId) m.content = responseText
        return m
      }))
      return
    }
    // Add new assistant message
    if (currChatIndex === -1 && responseId) {
      if (!responseText) {
        const msg: I_Message = {
          id: responseId,
          role: 'assistant',
          content: responseText,
          createdAt: formatDate(new Date()),
          modelId: currentModel?.modelId || '',
        }
        setThreads(prev => {
          return prev.map(thr => {
            if (thr.id === currentThreadId.current) thr.messages.push(msg)
            return thr
          })
        })
        setCurrentMessages(prev => {
          return [...prev, msg]
        })
      }
      return
    }
    // Update assistant message
    if (responseId && responseText) {
      setCurrentMessages(prev => prev.map(m => {
        if (m.id === responseId) m.content = responseText
        return m
      }))
      return
    }
  }, [currChatIndex, currentModel?.modelId, currentThreadId, isLoading, responseId, responseText, setCurrentMessages, setThreads])

  // Reset state
  useEffect(() => {
    return () => {
      currentThreadId.current = ''
      setIsLoading(false)
    }
  }, [currentThreadId, setIsLoading])

  return {
    append,
    reload,
    stop,
  }
}
