'use client'

import { useCallback, useEffect, useState } from "react"
import { usePathname } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { useHomebrew } from "@/lib/homebrew"
import { LocalChat } from "@/components/features/chat/interface-local-chat"
import { EmptyModelScreen } from "@/components/features/chat/chat-empty-model-screen"
import { ROUTE_PLAYGROUND } from "@/app/constants"
import { notifications } from "@/lib/notifications"

// @TODO Change this to async component and move all state to lower component so we can access server side props
export default function PlaygroundPage() {
  // @TODO assign `session` to globalContext for others to use
  // const session = await auth()
  // const username = session.user.name
  const session_id = ROUTE_PLAYGROUND
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const { services, currentModel, setCurrentModel, setServices, playgroundSettings } = useGlobalContext()
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const { getServices } = useHomebrew()
  const { loadModel } = useChatPage({ services })

  const getModel = useCallback(async () => {
    // Ask server if a model has been loaded and store state of result
    const modelRes = await services?.textInference.model()
    const success = modelRes?.success
    success && setCurrentModel(modelRes.data)
    return modelRes
  }, [services?.textInference, setCurrentModel])

  const loadModelAction = useCallback(async () => {
    // Eject first
    await services?.textInference?.unload?.()
    // Load
    return loadModel?.()
  }, [loadModel, services?.textInference])

  const loadPlaygroundModel = useCallback(async () => {
    const action = async () => {
      const res = await loadModelAction()
      if (res?.success) {
        const modelRes = await getModel()
        if (modelRes?.success) return modelRes
        return Promise.reject(modelRes?.message)
      }
      return Promise.reject(res?.message)
    }
    setIsLoading(true)
    await notifications().loadModel(action())
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
    const action = async () => {
      if (!isLoading && !hasLoaded) {
        await loadPlaygroundModel()
        setHasLoaded(true)
      }
    }
    action()
  }, [hasLoaded, isLoading, loadPlaygroundModel])

  if (isLoading)
    return (<div className="h-full w-full flex-1 bg-neutral-900"></div>)
  if (currentModel?.modelId)
    return (
      <LocalChat
        id={session_id}
        routeId={routeId}
        isLoading={isLoading}
        settings={playgroundSettings}
      />
    )
  return (
    <EmptyModelScreen id={session_id} loadModel={loadPlaygroundModel} />
  )
}
