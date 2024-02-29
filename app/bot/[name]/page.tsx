'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/features/chat/interface-local-chat'
import { I_ServiceApis, I_Text_Settings, useHomebrew } from '@/lib/homebrew'
// import { type Metadata } from 'next'
// import { notFound, redirect } from 'next/navigation'
// import { auth } from '@/auth'
// import { getChat } from '@/app/actions'

// export const runtime = 'edge'
// export const preferredRegion = 'home'

export interface I_PageProps {
  params: {
    name: string
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

export default function BotPage({ params }: I_PageProps) {
  const { name } = params
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const [isLoading, setIsLoading] = useState(true)
  const [doOnce, setDoOnce] = useState(false)
  const [botSettings, setBotSettings] = useState<I_Text_Settings>({} as I_Text_Settings)

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

  const fetchBot = useCallback(async () => {
    // Load the model from the bot settings on page mount.
    const res = await services?.storage.getBotSettings()
    const settings = res?.data
    const selectedModel = settings?.find(item => item.model.botName === name)
    return selectedModel
  }, [name, services?.storage])

  useEffect(() => {
    const action = async () => {
      const services = await getServices()
      setServices(services)
    }
    action()
  }, [getServices])

  // Maybe have this execute when the user first sends a request?
  useEffect(() => {
    if (doOnce || !services) return

    const action = async () => {
      // Load the model from the bot settings on page mount.
      const settings = await fetchBot()
      // Save settings
      settings && setBotSettings(settings)
      // Make payload
      const selectedModelId = settings?.model.id
      const mode = settings?.attention.mode
      const initOptions = settings?.performance
      const callOptions = {
        model: 'local', // @TODO should load from settings
        ...settings?.response
      }
      const listResponse = await services?.textInference.installed()
      const installedList = listResponse?.data
      const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
      // Load LLM
      const payload = {
        modelPath: installPath,
        modelId: selectedModelId,
        mode,
        init: initOptions,
        call: callOptions,
      }
      await services?.textInference.load({ body: payload })
      // Finished
      setIsLoading(false)
    }

    action()
    setDoOnce(true)
  }, [doOnce, fetchBot, services])

  return (
    <LocalChat
      id={name}
      routeId={routeId}
      initialMessages={initialMessages}
      services={services}
      isModelLoading={isLoading}
      setSettings={setBotSettings}
      settings={botSettings}
    />
  )
}
