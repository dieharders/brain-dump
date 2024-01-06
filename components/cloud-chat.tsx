'use client'

import { useEffect } from 'react'
import { useChat, type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { toast } from 'react-hot-toast'
import { useSettings } from './features/settings/hooks'
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

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        theme={theme}
      />
    </>
  )
}
