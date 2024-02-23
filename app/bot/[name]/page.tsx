'use client'

import { useEffect, useState } from 'react'
import { LocalChat } from '@/components/local-chat'
import { I_ServiceApis, useHomebrew } from '@/lib/homebrew'
import { type Message } from 'ai/react'
// import { type Metadata } from 'next'
// import { notFound, redirect } from 'next/navigation'
// import { auth } from '@/auth'
// import { getChat } from '@/app/actions'

// export const runtime = 'edge'
// export const preferredRegion = 'home'

export interface BotPageProps {
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

export default function BotPage({ params }: BotPageProps) {
  const { name } = params
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const [isLoading, setIsLoading] = useState(true)
  const [doOnce, setDoOnce] = useState(false)

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

  // Maybe have this execute when the user first sends a request?
  useEffect(() => {
    if (doOnce || !services) return

    const action = async () => {
      // Load the model from the bot settings on page mount.
      const res = await services?.storage.getBotSettings()
      const settings = res?.data
      const selectedModel = settings?.find(item => item.model.botName === name)
      const selectedModelId = selectedModel?.model.id
      const mode = selectedModel?.attention.mode
      const initOptions = selectedModel?.performance
      const callOptions = {
        model: 'local', // @TODO should load from settings
        ...selectedModel?.response
      }
      // Load LLM
      const listResponse = await services?.textInference.installed()
      const installedList = listResponse?.data
      const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
      const payload = { modelPath: installPath, modelId: selectedModelId, mode, init: initOptions, call: callOptions }
      await services?.textInference.load({ body: payload })
      // Finished
      setIsLoading(false)
    }

    action()
    setDoOnce(true)
  }, [doOnce, name, services])

  // @TODO Break out the charm menu from LocalChat since we want to pass specific charms to the chat per page
  return (
    <LocalChat
      id={name}
      initialMessages={initialMessages}
      services={services}
      isModelLoading={isLoading}
    />
  )
}
