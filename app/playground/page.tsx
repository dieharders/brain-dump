'use client'

import { useCallback, useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { type Message } from 'ai/react'
import { useGlobalContext } from '@/contexts'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { useHomebrew } from "@/lib/homebrew"
import { LocalChat } from "@/components/features/chat/interface-local-chat"
import { EmptyModelScreen } from "@/components/features/chat/chat-empty-model-screen"
import { ROUTE_PLAYGROUND } from "@/app/constants"
import { notifications } from "@/lib/notifications"

export default function PlaygroundPage() {
  const session_id = ROUTE_PLAYGROUND
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const { services, currentModel, setCurrentModel, setServices, playgroundSettings } = useGlobalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const initialMessages: Message[] = [] // @TODO Implement fetch func for chats and pass in
  const { getServices } = useHomebrew()
  const { loadModel } = useChatPage({ services })

  const getModel = useCallback(async () => {
    // Ask server if a model has been loaded and store state of result
    const modelRes = await services?.textInference.model()
    const success = modelRes?.success
    success && setCurrentModel(modelRes.data)
    return
  }, [services?.textInference, setCurrentModel])

  const loadModelAction = useCallback(async () => {
    const err = 'Failed to connect to Ai.'
    const action = async () => {
      try {
        // Eject first
        await services?.textInference?.unload?.()
        // Load
        const response = await loadModel?.()
        const success = response?.success
        const err = response?.message
        // Success
        if (success) return response
        // Fail
        throw err
      } catch (error) {
        throw err || error
      }
    }
    const result = await action()
    return result
  }, [loadModel, services?.textInference])

  const loadPlaygroundModel = useCallback(async () => {
    setIsLoading(true)
    await notifications().loadModel(loadModelAction())
    await getModel()
    setIsLoading(false)
  }, [loadModelAction, getModel])

  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      res && setServices(res)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  // Load model on mount
  useEffect(() => {
    if (!isLoading && !hasLoaded) {
      loadPlaygroundModel()
      setHasLoaded(true)
    }
  }, [hasLoaded, isLoading, loadPlaygroundModel])

  if (isLoading)
    return (<div className="h-full w-full flex-1 bg-neutral-900"></div>)
  if (currentModel?.modelId)
    return (
      <LocalChat
        id={session_id}
        routeId={routeId}
        initialMessages={initialMessages}
        isLoading={isLoading}
        settings={playgroundSettings}
      />
    )
  return (
    <EmptyModelScreen id={session_id} loadModel={loadPlaygroundModel} />
  )
}
