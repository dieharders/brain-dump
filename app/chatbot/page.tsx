'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { useChatBot } from '@/app/chatbot/useChatBot'
import { LocalChat } from '@/components/features/chat/interface-local-chat'
import { I_LoadedModelRes, I_ServiceApis, I_Text_Settings, useHomebrew } from '@/lib/homebrew'
import { EmptyModelScreen } from '@/components/features/chat/chat-empty-model-screen'
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
  const pathname = usePathname()
  const { getServices } = useHomebrew()
  const { searchParams } = props
  const name = searchParams.id
  const routeId = pathname.split('/')[1] // base url
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<I_Text_Settings>({} as I_Text_Settings)
  const { fetchSettings: fetchBotSettings, loadModel: loadChatBot } = useChatBot({ services })
  const [currentModel, setCurrentModel] = useState<I_LoadedModelRes | null>()
  const [hasFetched, setHasFetched] = useState(false)

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

  const getModel = useCallback(async () => {
    // Ask server if a model has been loaded and store state of result
    const modelRes = await services?.textInference.model()
    const success = modelRes?.success
    success && setCurrentModel(modelRes.data)
    return
  }, [services?.textInference])

  useEffect(() => {
    const action = async () => {
      const services = await getServices()
      setServices(services)
    }
    if (!services) action()
  }, [getServices, services])

  // Fetch settings
  useEffect(() => {
    const action = async () => {
      if (hasFetched || !fetchBotSettings) return

      setIsLoading(true)

      const res = await fetchBotSettings(name)
      res && setSettings(res)

      if (!currentModel) await getModel()

      setIsLoading(false)
      setHasFetched(true)
    }
    action()
  }, [currentModel, fetchBotSettings, getModel, hasFetched, name, settings])

  return (currentModel?.modelId ?
    <LocalChat
      id={name}
      routeId={routeId}
      initialMessages={initialMessages}
      services={services}
      isLoading={isLoading}
      settings={settings}
    />
    :
    <EmptyModelScreen id={name} loadModel={async (id) => {
      setIsLoading(true)
      loadChatBot && await loadChatBot(id)
      await getModel()
      setIsLoading(false)
    }} />
  )
}
