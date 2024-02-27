'use client'

import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { MixerHorizontalIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '@/components/ui/select'
import { DEFAULT_CONVERSATION_MODE, I_LLM_Init_Options, I_ModelConfigs, I_ServiceApis, T_InstalledTextModel } from "@/lib/homebrew"
import { ResponseCharmMenu, defaultState as defaultResponseState } from '@/components/features/prompt/dialog-response-charm'
import { I_LLM_Options } from '@/lib/hooks/types'

interface I_Props {
  installedList: T_InstalledTextModel[]
  modelConfigs: I_ModelConfigs
  services: I_ServiceApis | null
  selectedModelId: string | undefined
  isConnecting: boolean
  setIsConnecting: Dispatch<SetStateAction<boolean>>
  setHasTextServiceConnected: Dispatch<SetStateAction<boolean>>
  setSelectedModelId: Dispatch<SetStateAction<string | undefined>>
}

export const Playground = (props: I_Props) => {
  const { setSelectedModelId, setHasTextServiceConnected, isConnecting, setIsConnecting, installedList, modelConfigs, services, selectedModelId } = props
  const [openResponseCharmDialog, setOpenResponseCharmDialog] = useState(false)
  const [responseSettings, setResponseSettings] = useState<I_LLM_Init_Options>(defaultResponseState)

  const saveSettings = async (options: I_LLM_Options) => services?.storage.saveSettings({ body: options })
  const fetchSettings = useCallback(async () => services?.storage.getSettings(), [services?.storage])

  const installedModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.id]
    const name = cfg?.name
    return (<SelectItem key={item.id} value={item.id}>{name}</SelectItem>)
  })

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
        // Set "init" payload
        const initOptions = { ...settingsResponse?.data?.performance }
        // Set "call" payload
        const callOptions = { ...settingsResponse?.data?.response }
        // Tell backend to load the model into memory using these args
        const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
        const mode = DEFAULT_CONVERSATION_MODE // @TODO Set chat "mode" in payload from UI
        const payload = { modelPath: installPath, modelId: selectedModelId, mode, init: initOptions, call: callOptions }
        const response = await services?.textInference.load({ body: payload })

        if (response?.success) {
          toast.success('Connected successfully to Ai')
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
  }, [installedList, selectedModelId, services?.storage, services?.textInference, setIsConnecting])

  return (
    <>
      {/* Menu for Model settings */}
      <ResponseCharmMenu
        dialogOpen={openResponseCharmDialog}
        setDialogOpen={setOpenResponseCharmDialog}
        onSubmit={(charm, settings) => {
          saveSettings(settings)
          toast.success('Model settings saved!')
        }}
        settings={responseSettings || {}}
        modelConfig={modelConfigs?.[selectedModelId || '']}
      />
      <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 p-1 pb-4">
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
                await fetchSettings().then(res => {
                  const performance = res?.data?.performance || {}
                  setResponseSettings(prev => ({ ...prev, ...performance }))
                })
                setOpenResponseCharmDialog(true)
              }}>
            <MixerHorizontalIcon className="mr-1" />Settings
          </Button>}
        </div>
      </div>
    </>
  )
}
