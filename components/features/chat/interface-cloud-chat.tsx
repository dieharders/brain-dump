'use client'

import { useEffect } from 'react'
import { useChat, type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/features/chat/chat-list'
import { ChatPromptMenu } from '@/components/features/chat/chat-prompt-menu'
import { EmptyScreen } from '@/components/features/chat/chat-empty-screen'
import { ChatScrollAnchor } from '@/components/features/chat/chat-scroll-anchor'
import { toast } from 'react-hot-toast'
import { useSettings } from '@/components/features/settings/hooks'
import { AIModels } from '@/components/features/settings/hooks'

interface IProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  modelId: AIModels
}

export function CloudChat({ id, initialMessages, modelId, className }: IProps) {
  const { model, provider, aiToken } = useSettings()
  const { theme } = useTheme()
  const { messages, append, reload, stop, isLoading, input, setInput } = useChat({
    initialMessages,
    id,
    body: {
      id,
      token: aiToken,
      model,
    },
    api: `/api/chat/${provider}`,
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    },
  })

  useEffect(() => {
    console.log('[cloud] modelId:', modelId)
  }, [modelId])

  // @TODO Uncomment components below and replace with server side components
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            {/* <ChatList messages={messages} /> */}
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          null
          // <EmptyScreen setInput={setInput} />
        )}
      </div>
      {/* <ChatPromptMenu
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        theme={theme}
      /> */}
    </>
  )
}
