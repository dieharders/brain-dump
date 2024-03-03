'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/features/chat/interface-local-chat'
import { I_ServiceApis, I_Text_Settings, useHomebrew } from '@/lib/homebrew'
import { useChatBot } from '@/app/chatbot/useChatbot'
// import { type Metadata } from 'next'
// import { notFound, redirect } from 'next/navigation'
// import { auth } from '@/auth'
// import { getChat } from '@/app/actions'

// export const runtime = 'edge'
// export const preferredRegion = 'home'

export interface I_PageProps {
  searchParams: {
    id: string
  }
}

// export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
//   const session = await auth()

//   if (!session?.user) {
//     return {}
//   }

//   const chat = await getChat(params.id, session.user.id)
//   return {
//     title: chat?.title.toString().slice(0, 50) ?? 'Chat',
//   }
// }

export default function BotPage(props: any) {
  const { searchParams } = props
  const name = searchParams.id
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<I_Text_Settings>({} as I_Text_Settings)
  const { fetchSettings: fetchBotSettings } = useChatBot({ services })

  // const session = await auth()

  // if (!session?.user) {
  //   redirect(`/sign-in?next=/chat/${name}`)
  // }

  // const chat = await getChat(name, session.user.id)

  // if (!chat) {
  //   notFound()
  // }

  // if (chat?.userId !== session?.user?.id) {
  //   notFound()
  // }

  useEffect(() => {
    const action = async () => {
      const services = await getServices()
      setServices(services)
    }
    action()
  }, [getServices])

  // fetch settings here
  useEffect(() => {
    const action = async () => {
      setIsLoading(true)
      const res = await fetchBotSettings(name)
      res && setSettings(res)
      setIsLoading(false)
    }
    action()
  }, [fetchBotSettings, name])

  return (
    <LocalChat
      id={name}
      routeId={routeId}
      initialMessages={initialMessages}
      services={services}
      isLoading={isLoading}
      settings={settings}
    />
  )
}
