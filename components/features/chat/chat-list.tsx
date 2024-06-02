'use client'

import { ChatMessage } from '@/components/features/chat/chat-message'
import { useGlobalContext } from '@/contexts'
import { I_Message } from '@/lib/homebrew'

export interface ChatList {
  messages: I_Message[]
  theme?: string | undefined
}

export const ChatList = ({ messages, theme = 'light' }: ChatList) => {
  const { isAiThinking } = useGlobalContext()
  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id}>
          <ChatMessage
            isLoading={isAiThinking && index === messages?.length - 1}
            message={message}
            theme={theme}
          />
        </div>
      ))}
    </div>
  )
}
