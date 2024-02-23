'use client'

import { useCallback, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel, useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { ApplicationModesMenu } from '@/components/features/menus/app/menu-application-modes'
import { toast } from 'react-hot-toast'

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
  const [installedList, setInstalledList] = useState<T_InstalledTextModel[]>([])
  const [modelConfigs, setModelConfigs] = useState<I_ModelConfigs>()

  const connect = useCallback(async () => {
    setIsConnecting(true)

    // Attempt to verify the local provider and text inference service exists.
    if (selectedProvider === ModelID.Local) {
      const res = await connectToHomebrew()

      // Record the attempt
      setIsConnecting(false)

      if (res?.success) {
        toast.success(`Connected to local provider`)
        setIsConnected(true)
        // Get all possible server endpoints
        const homebrewServices = await getServices()
        if (homebrewServices) setServices(homebrewServices)
        // Get all currently installed models
        const listResponse = await homebrewServices?.textInference.installed()
        listResponse?.data && setInstalledList(listResponse.data)
        // Get all model configs
        const cfgs = await homebrewServices?.textInference.getModelConfigs()
        cfgs?.data && setModelConfigs(cfgs.data)
        // Success
        return true
      }
      toast.error(`Failed to connect to local provider.`)
      return false
    }

    setIsConnecting(false)
    return false
  }, [connectToHomebrew, getServices, selectedProvider])

  const isLocalSelected = selectedProvider === ModelID.Local
  const isCloudSelected = selectedProvider !== ModelID.Local && selectedModel !== 'no model selected'


  // HomeBrewAi connection menu
  if (!isConnected)
    return (
      <>
        <div className="m-4 text-center">Waiting to connect to server</div>
        <Button
          className="text-white-50 m-4 w-fit bg-blue-600 px-16 text-center text-white hover:bg-blue-800"
          onClick={connect}
          disabled={isConnecting}
        >
          Connect to HomeBrewAi
        </Button>
      </>
    )

  // Inference connection menu
  if (!hasTextServiceConnected)
    return (
      // Model Selection Menu
      < div className="flex w-full flex-col overflow-hidden p-4 md:w-[70%]" >
        {/* <h1 className="mt-4 px-4 text-center text-xl">Connected to HomebrewAi server</h1> */}
        <ApplicationModesMenu
          setHasTextServiceConnected={setHasTextServiceConnected}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          modelConfigs={modelConfigs || {}}
          installedList={installedList}
          onSubmit={() => {
            /* logic to go to a route */
            console.log('@@ going to route page')
          }}
          services={services}
        />
      </div >
    )

  // Render "Connecting..." feedback
  if (isConnecting && !isConnected)
    return <div className="m-4 text-center">Connecting to server...</div>
  // Connected
  if (!isConnecting && isConnected) {
    // Render chat UI (Local)
    if (isLocalSelected)
      return (
        <LocalChat
          id={id}
          initialMessages={initialMessages}
          services={services}
        />
      )
    // Render chat UI (cloud)
    if (isCloudSelected)
      // return <CloudChat id={id} initialMessages={initialMessages} />
      return <div className="m-4 text-center">Connect to Cloud provider...</div>
    // Render "no selection" warning
    return <div className="m-4 text-center">No model selected. Go to settings {'->'} LLM Model and choose one.</div>
  }
}
