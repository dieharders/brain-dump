'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { LocalChat } from '@/components/features/chat/interface-local-chat'
import { I_Message, I_Text_Settings, useHomebrew } from '@/lib/homebrew'
import { EmptyModelScreen } from '@/components/features/chat/chat-empty-model-screen'
import toast from 'react-hot-toast'
import { useGlobalContext } from '@/contexts'
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
  const { services, setServices } = useGlobalContext()
  const { searchParams } = props
  const name = searchParams.id
  const routeId = pathname.split('/')[1] // base url
  const initialMessages: I_Message[] = [] // @TODO Implement fetch func for chats and pass in. Pass these in instead? Dont need, we have globalcontext for thread
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<I_Text_Settings>({} as I_Text_Settings)
  const { fetchChatBotSettings, loadModel: loadChatBot } = useChatPage({ services })
  const { currentModel, setCurrentModel } = useGlobalContext()
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
  }, [services?.textInference, setCurrentModel])

  useEffect(() => {
    const action = async () => {
      const s = await getServices()
      s && setServices(s)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  // Fetch settings
  useEffect(() => {
    const action = async () => {
      if (hasFetched || !fetchChatBotSettings) return

      setIsLoading(true)
      toast.loading('Fetching data...', { id: 'fetch-data' })

      const res = await fetchChatBotSettings(name)
      res && setSettings(res)

      if (!currentModel) await getModel()

      setIsLoading(false)
      setHasFetched(true)
      toast.dismiss('fetch-data')
    }
    action()
  }, [currentModel, fetchChatBotSettings, getModel, hasFetched, name])

  if (isLoading)
    return (<div className="h-full w-full flex-1 bg-neutral-900"></div>)

  return (currentModel?.modelId ?
    <LocalChat
      routeId={routeId}
      initialMessages={initialMessages}
      isLoading={isLoading}
      settings={settings}
    />
    :
    <EmptyModelScreen
      id={name}
      loadModel={async (id) => {
        setIsLoading(true)
        loadChatBot && await loadChatBot(id)
        await getModel()
        setIsLoading(false)
      }} />
  )
}
