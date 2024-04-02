'use client'

import { useCallback, useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { I_LoadedModelRes, I_ServiceApis, I_Text_Settings, useHomebrew } from "@/lib/homebrew"
import { defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { LocalChat } from "@/components/features/chat/interface-local-chat"
import { EmptyModelScreen } from "@/components/features/chat/chat-empty-model-screen"
import { ROUTE_PLAYGROUND } from "@/app/constants"
import toast from "react-hot-toast"

const defaultState = {
  attention: defaultAttentionState,
  performance: defaultPerformanceState,
  system: defaultSystemState,
  model: defaultModelState,
  prompt: defaultPromptState,
  knowledge: defaultKnowledgeState,
  response: defaultResponse,
}

export default function PlaygroundPage() {
  const session_id = ROUTE_PLAYGROUND
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentModel, setCurrentModel] = useState<I_LoadedModelRes | null>()
  const [settings, setSettings] = useState<I_Text_Settings>(defaultState)
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const { getServices } = useHomebrew()
  const { fetchPlaygroundSettings: fetchSettings, loadModel: loadPlaygroundModel } = useChatPage({ services })
  const [hasFetched, setHasFetched] = useState(false)

  const getModel = useCallback(async () => {
    // Ask server if a model has been loaded and store state of result
    const modelRes = await services?.textInference.model()
    const success = modelRes?.success
    success && setCurrentModel(modelRes.data)
    return
  }, [services?.textInference])

  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      setServices(res)
    }
    if (!services) action()
  }, [getServices, services])

  // Fetch settings
  useEffect(() => {
    const action = async () => {
      if (hasFetched || !fetchSettings) return

      setIsLoading(true)
      toast.loading('Fetching data...', { id: 'fetch-data' })

      const res = await fetchSettings()
      res && setSettings(res)

      if (!currentModel) await getModel()

      setIsLoading(false)
      setHasFetched(true)
      toast.dismiss('fetch-data')
    }
    action()
  }, [currentModel, fetchSettings, getModel, hasFetched])

  if (isLoading)
    return (<div className="h-full w-full flex-1 bg-neutral-900"></div>)
  if (currentModel?.modelId)
    return (
      <LocalChat
        id={session_id}
        routeId={routeId}
        initialMessages={initialMessages}
        services={services}
        isLoading={isLoading}
        setSettings={setSettings}
        settings={settings}
      />
    )
  return (
    <EmptyModelScreen id={session_id} loadModel={async () => {
      setIsLoading(true)
      loadPlaygroundModel && await loadPlaygroundModel()
      await getModel()
      setIsLoading(false)
    }} />
  )
}
