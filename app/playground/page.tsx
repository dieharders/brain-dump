'use client'

import { useCallback, useEffect, useState } from "react"
import { type Message } from 'ai/react'
import { I_ServiceApis, I_Text_Settings, useHomebrew } from "@/lib/homebrew"
import { defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { LocalChat } from "@/components/local-chat"

const defaultState = {
  attention: defaultAttentionState,
  performance: defaultPerformanceState,
  system: defaultSystemState,
  model: defaultModelState,
  prompt: defaultPromptState,
  knowledge: defaultKnowledgeState,
  response: defaultResponse,
}

export interface I_PageProps {
  params: {
    name: string
  }
}

export default function PlaygroundPage() {
  const [doOnce, setDoOnce] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const [settings, setSettings] = useState<I_Text_Settings>(defaultState)
  const session_id = 'playground'

  const fetchSettings = useCallback(async () => {
    // Load the model from settings on page mount
    const res = await services?.storage.getPlaygroundSettings()
    const s = res?.data
    return s
  }, [services?.storage])

  useEffect(() => {
    const action = async () => {
      const services = await getServices()
      setServices(services)
    }
    action()
  }, [getServices])

  useEffect(() => {
    if (doOnce || !services) return

    const action = async () => {
      // Load the model from the bot settings on page mount.
      const res = await fetchSettings()
      // Save settings
      const newSettings = { ...settings, ...res }
      res && setSettings(newSettings)
      // Make payload
      const selectedModelId = newSettings?.model?.id
      const mode = newSettings?.attention?.mode
      const initOptions = newSettings?.performance
      const callOptions = {
        model: 'local', // @TODO should load from a menu setting
        ...newSettings?.response
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
  }, [doOnce, fetchSettings, services, settings])

  return (
    <LocalChat
      id={session_id}
      initialMessages={initialMessages}
      services={services}
      isModelLoading={isLoading}
      setSettings={setSettings}
      settings={settings}
    />
  )
}
