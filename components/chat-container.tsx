'use client'

import { useCallback, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { I_ServiceApis, useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

declare global {
  interface Window {
    homebrewai?: {
      hasInitConnection?: boolean,
    }
  }
}

interface IProps {
  id?: string
  initialMessages?: Message[]
}

/**
 * This holds the main app behavior
 */
export const ChatContainer = ({ id, initialMessages }: IProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [hasTextServiceConnected, setHasTextServiceConnected] = useState(false)
  const { provider: selectedProvider, model: selectedModel } = useSettings()
  const { connect: connectToHomebrew, getServices } = useHomebrew()
  const [currentTextModel, setCurrentTextModel] = useState(null)

  const connect = useCallback(async () => {
    setIsConnecting(true)

    // Attempt to verify the local provider and text inference service exists.
    if (selectedProvider === ModelID.Local) {
      const res = await connectToHomebrew()

      // Record the attempt
      setIsConnecting(false)

      if (res?.success) {
        toast.success(`Connected to local provider...waiting for Ai connection...`)
        setIsConnected(true)
        // Get all possible server endpoints
        const homebrewServices = await getServices()
        if (homebrewServices) setServices(homebrewServices)
        return true
      }
      toast.error(`Failed to connect to local provider.`)
      return false
    }

    setIsConnecting(false)
    return false
  }, [connectToHomebrew, getServices, selectedProvider])

  const connectTextServiceAction = useCallback(async () => {
    const action = async () => {
      try {
        // First check if a model is already loaded, if so skip...
        const modelResponse = await services?.textInference.models()
        if (modelResponse?.success) {
          toast.success(`Success: ${modelResponse?.message}`)
          return true
        }
        // Pass any settings data we find, We could instead pass init args from a user input, using saved settings for now.
        const settingsResponse = await services?.storage.getSettings()
        if (!settingsResponse?.success) {
          toast.error(`${settingsResponse?.message}`)
        }
        // @TODO Pass modelId from user defined input...
        const modelId = 'llama-2-13b-chat'
        // Remove "preset" from payload
        const initOptions = { ...settingsResponse?.data?.init }
        if (initOptions?.preset) delete initOptions['preset']
        // Tell backend to load the model into memory using these args
        const payload = { modelId, ...initOptions }
        const response = await services?.textInference.load({ body: payload })

        if (response?.success) {
          toast.success('Connected successfully to Ai')
          setCurrentTextModel(response?.data)
          return true
        }

        toast.error(response?.message || 'Failed to connect to Ai.')
        return false
      } catch (error) {
        toast.error(`${error}`)
        return false
      }
    }

    setIsConnecting(true)
    const result = await action()
    setIsConnecting(false)
    return result
  }, [services?.storage, services?.textInference])

  const isLocalSelected = selectedProvider === ModelID.Local
  const isCloudSelected = selectedProvider !== ModelID.Local && selectedModel !== 'no model selected'

  // Render "Waiting..." feedback
  if (!isConnected)
    return (
      <>
        <div className="m-4 text-center">Waiting for server...</div>
        <Button
          className="text-white-50 m-4 w-fit bg-blue-600 px-16 text-center hover:bg-white hover:text-blue-700"
          onClick={connect}
          disabled={isConnecting}
        >
          Connect to HomeBrewAi
        </Button>
      </>
    )

  // Render "Connect Ai" button
  // @TODO This should be a drop down selector for model id and a connect button
  if (!hasTextServiceConnected)
    return (
      <>
        <div className="m-4 text-center">Connected to HomebrewAi server.<br />Waiting for Ai engine to start...</div>
        <Button
          className="text-white-50 m-4 w-fit bg-blue-600 px-16 text-center hover:bg-white hover:text-blue-700"
          onClick={async () => {
            setIsConnecting(true)
            const isConnected = await connectTextServiceAction()
            isConnected && setHasTextServiceConnected(true)
            setIsConnecting(false)
          }}
          disabled={isConnecting}
        >
          Connect to Ai
        </Button>
      </>
    )

  // Render "Connecting..." feedback
  if (isConnecting && !isConnected)
    return <div className="m-4 text-center">Connecting to server...</div>
  // Connected
  if (!isConnecting && isConnected) {
    // Render chat UI (Local)
    if (isLocalSelected)
      return <LocalChat id={id} initialMessages={initialMessages} services={services} currentTextModel={currentTextModel} />
    // Render chat UI (cloud)
    if (isCloudSelected)
      // return <CloudChat id={id} initialMessages={initialMessages} />
      return <div className="m-4 text-center">Connect to Cloud provider...</div>
    // Render "no selection" warning
    return <div className="m-4 text-center">No model selected. Go to settings {'->'} LLM Model and choose one.</div>
  }
}
