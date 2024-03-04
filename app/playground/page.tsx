'use client'

import { useCallback, useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { usePlayground } from "@/app/playground/usePlayground"
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
  const { fetchSettings, loadModel: loadPlaygroundModel } = usePlayground({ services })

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
      setIsLoading(true)

      if (!settings) {
        const res = await fetchSettings?.()
        res && setSettings(res)
      }

      if (!currentModel) await getModel()

      setIsLoading(false)
    }
    action()
  }, [currentModel, fetchSettings, getModel, settings])

  // @TODO Create and pass a model readout panel with `currentModel` to LocalChat, or bake the component in?

  return (currentModel?.model_id ?
    <LocalChat
      id={session_id}
      routeId={routeId}
      initialMessages={initialMessages}
      services={services}
      isLoading={isLoading}
      setSettings={setSettings}
      settings={settings}
    />
    :
    <EmptyModelScreen id={session_id} loadModel={async () => {
      setIsLoading(true)
      loadPlaygroundModel && await loadPlaygroundModel()
      await getModel()
      setIsLoading(false)
    }} />
  )
}
