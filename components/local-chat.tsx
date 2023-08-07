'use client'

import { useEffect } from 'react'
import { type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { AIModels } from '@/components/features/settings/hooks'
import { useLocalInference } from '@/lib/hooks/use-local-chat'

interface IProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  modelId: AIModels | undefined
}

export const LocalChat = ({ id, initialMessages, modelId, className }: IProps) => {
  const { theme } = useTheme()
  const { append, messages, reload, stop, input, setInput, isLoading } =
    useLocalInference({
      initialMessages,
    })

  useEffect(() => {
    console.log('@@ [local component] modelId:', modelId)
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
