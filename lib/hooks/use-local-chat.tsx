import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDate, nanoid } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { useChatHelpers } from '@/lib/hooks/use-chat-helpers'
import { useGlobalContext } from '@/contexts'
import { DEFAULT_CONVERSATION_MODE, I_InferenceGenerateOptions, I_Message, I_Text_Settings, I_Thread } from '@/lib/homebrew'
import { Session } from 'next-auth/types'

interface I_Session extends Session {
  user: {
    id: string
    email: string
    exp: number
    iat: number
    jti: string
    name: string
    sub: string
  }
}

interface IProps {
  settings?: I_Text_Settings | null
  session: I_Session
}

export const useLocalInference = (props: IProps) => {
  const { settings, session } = props
  const { services, isAiThinking: isLoading, setIsAiThinking: setIsLoading, currentThreadId, threads, setThreads, currentModel } = useGlobalContext()
  const { processSseStream } = useChatHelpers()
  const [responseText, setResponseText] = useState<string>('')
  const [responseId, setResponseId] = useState<string | null>(null)
  const abortRef = useRef(false)
  const currThread = threads.find(v => v.id === currentThreadId.current)
  const currChatIndex = currThread?.messages?.findIndex(msg => msg?.id === responseId) || -1

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
  }, [])

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

  const saveThread = useCallback(async (prevThreads: I_Thread[]) => {
    const prevThread = prevThreads.find(t => t.id === currentThreadId.current)
    const prevMessages = prevThread?.messages
    if (!prevMessages) return
    if (prevMessages?.length === 2) {
      // Save new thread
      services?.storage.saveChatThread({
        body: {
          threadId: currentThreadId.current,
          thread: {
            id: currentThreadId.current,
            createdAt: formatDate(new Date()),
            title: prevMessages?.[0].content.slice(0, 36) || '',
            summary: '',
            numMessages: prevMessages?.length || 0,
            messages: prevMessages,
            userId: session?.user.id || session.user.sub || '', // ids come as "sub" when using jwtoken
            // sharePath: `/thread?id=${newThreadId}`, // this is added later when user allows sharing
          },
        }
      })
    } else if (prevMessages?.length >= 4) {
      // Save new messages to disk
      services?.storage.saveChatThread({
        body: {
          threadId: prevThread?.id,
          thread: {
            ...prevThread,
            messages: prevMessages,
            numMessages: prevMessages?.length || 0,
          },
        }
      })
    }
  }, [currentThreadId, services?.storage, session?.user.id, session.user?.sub])

  const stop = useCallback(() => {
    // Save response
    setThreads(prev => {
      saveThread(prev)
      return prev
    })
    // Reset state
    setIsLoading(false)
    abortRef.current = true
  }, [saveThread, setIsLoading, setThreads])

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
    // Create new thread for message or update existing one
    setThreads(prev => {
      // Create new thread if no thread is selected
      if (!currentThreadId.current) {
        const newThreadId = nanoid()
        const newThread = {
          id: newThreadId,
          messages: [newUserMsg],
        } as I_Thread
        currentThreadId.current = newThreadId
        return [newThread]
      }

      // Otherwise, Update existing thread
      const existing = prev.map(t => {
        if (t.id === currentThreadId.current) t.messages.push(newUserMsg)
        return t
      })
      return existing
    })

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
      }

      // Check success if not streamed (playground)
      if (typeof response?.text === 'string') {
        onNonStreamResult(response?.text)
      }
      // Save results
      setThreads(prev => {
        saveThread(prev)
        return prev
      })
      // Finish
      setIsLoading(false)
      return
    } catch (err) {
      setIsLoading(false)
      toast.error(`Prompt request error: \n ${err}`)
    }
  }, [saveThread, setThreads, currentThreadId, getCompletion, onNonStreamResult, onStreamResult, processSseStream, services?.textInference, setIsLoading, settings])

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
      setThreads(prevThreads => {
        return prevThreads.map(prevThread => {
          if (prevThread.id === currentThreadId.current) {
            // remove last msg
            const newMessages = prevThread.messages.slice(0, -2)
            prevThread.messages = newMessages
          }
          return prevThread
        })
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
  }, [setIsLoading, currThread?.messages, setThreads, append, session?.user.name, currentThreadId])

  // Update messages with assistant's response
  useEffect(() => {
    if (!isLoading) return
    if (currChatIndex === -1 && responseId) {
      if (!responseText) {
        // Add new assistant message
        setThreads(prev => {
          const msg: I_Message = {
            id: responseId,
            role: 'assistant',
            content: responseText,
            createdAt: formatDate(new Date()),
            modelId: currentModel?.modelId || '',
          }
          return prev.map(thr => {
            if (thr.id === currentThreadId.current) thr.messages.push(msg)
            return thr
          })
        })
      }
    } else if (responseId && responseText) {
      // Update assistant message
      setThreads(prevThreads => {
        return prevThreads.map(thr => {
          if (thr.id === currentThreadId.current) {
            const newMsgs = thr.messages.map(m => {
              if (m?.id === responseId) m.content = responseText
              return m
            })
            thr.messages = newMsgs
          }
          return thr
        })
      })
    }
  }, [currChatIndex, currentModel?.modelId, currentThreadId, isLoading, responseId, responseText, setThreads])

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
