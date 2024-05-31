import { auth } from "@/auth"
import { ChatProvider } from "@/components/features/pages/page-chat-provider"

export default async function Page() {
  const session = await auth()

  // This component provides all logic and behavior to <ChatPage />
  return <ChatProvider session={session} />
}
