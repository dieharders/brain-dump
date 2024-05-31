'use client'

import { useCallback, useEffect, useState } from "react"
import { Session } from "next-auth/types"
import { usePathname, useSearchParams } from 'next/navigation'
import { ROUTE_PLAYGROUND } from "@/app/constants"
import { I_Text_Settings, useHomebrew } from "@/lib/homebrew"
import { useGlobalContext } from "@/contexts"
import { ChatPageLocal } from '@/components/features/chat/chat-page-local'
import { EmptyModelScreen } from '@/components/features/chat/chat-empty-model-screen'
import { loadTextModel } from "@/components/features/pages/client-actions-ai"

const PlaygroundPage = ({ isLoading, session, services, action, settings, fetchSettings }: any) => {
  const { currentModel } = useGlobalContext()

  // Load model on mount
  useEffect(() => {
    action()
  }, [action])

  return (
    currentModel?.modelId ?
      <ChatPageLocal
        routeId={ROUTE_PLAYGROUND}
        isLoading={isLoading}
        settings={settings}
        session={session}
      />
      :
      <EmptyModelScreen
        id={ROUTE_PLAYGROUND}
        loadModel={async () => loadTextModel(services, fetchSettings)}
      />
  )
}

const BotPage = ({ isLoading, services, session, action, settings, routeId, name }: any) => {
  const { currentModel } = useGlobalContext()

  // Load model on mount
  useEffect(() => {
    action()
  }, [action])

  return (
    currentModel?.modelId ?
      <ChatPageLocal
        routeId={routeId}
        isLoading={isLoading}
        settings={settings}
        session={session}
      />
      :
      <EmptyModelScreen
        id={name}
        loadModel={async () => loadTextModel(services, async () => settings)}
      />
  )
}

export interface I_Props {
  session: Session
}

export const ChatProvider = (props: I_Props) => {
  const { session } = props
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const searchParams = useSearchParams()
  const botName = searchParams.get('id') || ''
  const { getServices } = useHomebrew()
  const { services, setServices, setCurrentModel, playgroundSettings } = useGlobalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [settings, setSettings] = useState<I_Text_Settings | undefined>()

  const fetchPlaygroundSettings = useCallback(async () => playgroundSettings, [playgroundSettings])

  const playgroundAction = useCallback(async () => {
    if (!services || isLoading || hasLoaded) return
    setIsLoading(true)
    const res = await loadTextModel(services, fetchPlaygroundSettings)
    res?.success && setCurrentModel(res?.data)
    setHasLoaded(true)
    setIsLoading(false)
  }, [fetchPlaygroundSettings, hasLoaded, isLoading, services, setCurrentModel])

  const fetchChatBotSettings = useCallback(async () => {
    // Load the model from the bot settings on page mount.
    const res = await services?.storage.getBotSettings()
    const settingsRes = res?.data
    const selectedModel = settingsRes?.find(item => item.model.botName === botName)
    return selectedModel
  }, [botName, services?.storage])

  const botAction = useCallback(async () => {
    if (!services || isLoading || hasLoaded || settings) return
    setIsLoading(true)
    const settingsResponse = await fetchChatBotSettings()
    settingsResponse && setSettings(settingsResponse)
    const res = await loadTextModel(services, async () => settingsResponse)
    res?.success && setCurrentModel(res?.data)
    setHasLoaded(true)
    setIsLoading(false)
    return
  }, [fetchChatBotSettings, hasLoaded, isLoading, services, setCurrentModel, settings])

  // Get services
  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      res && setServices(res)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  // Reset state
  useEffect(() => {
    return () => {
      setHasLoaded(false)
      setIsLoading(false)
      setCurrentModel(null)
    }
  }, [setCurrentModel])

  if (isLoading)
    return (<div className="h-full w-full flex-1 bg-neutral-900"></div>)

  return routeId === ROUTE_PLAYGROUND ?
    <PlaygroundPage
      isLoading={isLoading}
      settings={playgroundSettings}
      session={session}
      services={services}
      action={playgroundAction}
      fetchSettings={fetchPlaygroundSettings}
    />
    :
    <BotPage
      isLoading={isLoading}
      action={botAction}
      name={botName}
      routeId={routeId}
      settings={settings}
      session={session}
      services={services}
    />
}
