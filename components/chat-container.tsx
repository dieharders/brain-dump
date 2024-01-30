'use client'

import { useCallback, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { I_ServiceApis, T_InstalledTextModel, T_ModelConfig, useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ResponseCharmMenu } from '@/components/features/prompt/dialog-response-charm'
import { MixerHorizontalIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import { I_LLM_Options } from '@/lib/hooks/types'

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
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined)
  const [installedList, setInstalledList] = useState<T_InstalledTextModel[]>([])
  const [modelConfigs, setModelConfigs] = useState<{ [key: string]: T_ModelConfig }>()
  const [openResponseCharmDialog, setOpenResponseCharmDialog] = useState(false)
  const [responseSettings, setResponseSettings] = useState(null)

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

  const connectTextServiceAction = useCallback(async () => {
    const action = async () => {
      try {
        // First check if a model is already loaded, if so skip...
        const modelResponse = await services?.textInference.model()
        if (modelResponse?.success) {
          toast.success(`Success: ${modelResponse?.message}`)
          return true
        }
        // Pass any settings data we find, We could instead pass init args from a user input, using saved settings for now.
        const settingsResponse = await services?.storage.getSettings()
        if (!settingsResponse?.success) {
          toast.error(`${settingsResponse?.message}`)
        }
        // Remove "preset" from init payload
        const initOptions = { ...settingsResponse?.data?.init }
        if (initOptions?.preset) delete initOptions['preset']
        // Set "call" payload
        const callOptions = { ...settingsResponse?.data?.call }
        // Tell backend to load the model into memory using these args
        const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
        const mode = 'completion' // @TODO Set chat "mode" in payload from UI
        const payload = { modelPath: installPath, modelId: selectedModelId, mode, init: initOptions, call: callOptions }
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
  }, [installedList, selectedModelId, services?.storage, services?.textInference])

  const isLocalSelected = selectedProvider === ModelID.Local
  const isCloudSelected = selectedProvider !== ModelID.Local && selectedModel !== 'no model selected'

  const installedModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.id]
    const name = cfg?.name
    return (<SelectItem key={item.id} value={item.id}>{name}</SelectItem>)
  })

  const fetchSettings = useCallback(async () => services?.storage.getSettings(), [services?.storage])

  const saveSettings = async (options: I_LLM_Options) => services?.storage.saveSettings({ body: options })

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
      <>
        {/* Dialog Menu for Response settings */}
        <ResponseCharmMenu
          dialogOpen={openResponseCharmDialog}
          setDialogOpen={setOpenResponseCharmDialog}
          onSubmit={(charm, settings) => {
            saveSettings(settings)
            toast.success('Model settings saved!')
          }}
          settings={responseSettings}
          modelConfig={modelConfigs?.[selectedModelId || '']}
        />
        {/* Model Selection Menu */}
        <div className="flex w-full flex-col gap-16 overflow-hidden p-4 sm:w-[50%]">
          <div className="mt-4 px-4 text-center">Connected to HomebrewAi server</div>
          <div className="flex flex-col items-stretch justify-items-stretch gap-4">
            {/* Start */}
            {selectedModelId && <Button
              className="h-fit min-w-fit flex-1 bg-blue-600 px-8 text-center text-white hover:bg-blue-800"
              onClick={async () => {
                setIsConnecting(true)
                const isConnected = await connectTextServiceAction()
                isConnected && setHasTextServiceConnected(true)
                setIsConnecting(false)
              }}
              disabled={isConnecting}
            >
              <LightningBoltIcon className="mr-1" />Start
            </Button>}
            <div className="flex flex-row gap-2">
              {/* Select a prev installed model to load */}
              <div className="w-full">
                <Select
                  defaultValue={undefined}
                  value={selectedModelId}
                  onValueChange={setSelectedModelId}
                >
                  <SelectTrigger className="w-full flex-1">
                    <SelectValue placeholder="Select Ai Model"></SelectValue>
                  </SelectTrigger>
                  <SelectGroup>
                    <SelectContent className="p-1">
                      <SelectLabel className="select-none uppercase text-indigo-500">Installed</SelectLabel>
                      {installedModels}
                    </SelectContent>
                  </SelectGroup>
                </Select>
              </div>
              {/* Model Settings Button */}
              {selectedModelId && <Button
                className="m-auto h-fit bg-accent-foreground hover:bg-accent"
                variant="outline"
                onClick={
                  async () => {
                    await fetchSettings().then(res => setResponseSettings(res?.data?.init))
                    setOpenResponseCharmDialog(true)
                  }}>
                <MixerHorizontalIcon className="mr-1" />Settings
              </Button>}
            </div>
          </div>
        </div>
      </>
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
          currentTextModel={currentTextModel}
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
