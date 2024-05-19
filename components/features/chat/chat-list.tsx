import { type Message } from 'ai'
import { ChatMessage } from '@/components/features/chat/chat-message'
// import { Separator } from '@/components/ui/separator'

export interface ChatList {
  messages: Message[]
}

export const ChatList = ({ messages }: ChatList) => {

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, _index) => (
        <div key={message.id}>
          <ChatMessage message={message} />
          {/* {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )} */}
        </div>
      ))}
    </div>
  )
}
