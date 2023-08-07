import { nanoid } from '@/lib/utils'
import { ChatContainer } from '@/components/chat-container'

export const runtime = 'edge'

export default function IndexPage() {
  const id = nanoid()
  return <ChatContainer id={id} />
}
