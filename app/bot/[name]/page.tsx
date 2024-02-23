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

  useEffect(() => {
    // @TODO Load the model from the bot settings on page mount. Disable all other buttons until loaded.
    // fetch [name] settings
    // load llm model
  }, [])

  // @TODO Break out the charm menu from LocalChat since we want to pass specific charms to the chat per page
  return (
    <LocalChat
      id={name}
      initialMessages={initialMessages}
      services={services}
    />
  )
}
