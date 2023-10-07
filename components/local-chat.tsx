'use client'

import { type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { AIModels } from '@/components/features/settings/hooks'
import { useLocalInference } from '@/lib/hooks/use-local-chat'
import { I_ServiceApis } from '@/lib/homebrew'

interface IProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  modelId: AIModels | undefined
  apis: I_ServiceApis | null
}

export const LocalChat = ({ id, initialMessages, modelId, apis, className }: IProps) => {
  const { theme } = useTheme()
  const { append, messages, reload, stop, input, setInput, isLoading } =
    useLocalInference({
      initialMessages,
      apis,
    })

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
