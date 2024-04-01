'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel } from "@/lib/homebrew"
import { PerformanceMenu } from '@/components/features/menus/playground/menu-performance'
import { usePerformanceMenu } from '@/components/features/menus/playground/hook-performance'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { ROUTE_PLAYGROUND } from "@/app/constants"
import { cn } from "@/lib/utils"

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
  const nativeSelectStyle = cn("my-1 flex w-full rounded-md bg-accent p-4 text-lg capitalize outline-2 outline-offset-2 outline-muted focus:hover:outline [@media(hover:hover)]:hidden")
  const { setSelectedModelId, setHasTextServiceConnected, isConnecting, setIsConnecting, installedList, modelConfigs, services, selectedModelId } = props
  const router = useRouter()
  const { loadModel: loadPlaygroundModel } = useChatPage({ services })
  const [selectedModelFile, setSelectedModelFile] = useState<string>('')
  const [openResponseCharmDialog, setOpenResponseCharmDialog] = useState(false)
  const {
    stateAttention,
    setStateAttention,
    statePerformance,
    setStatePerformance,
  } = usePerformanceMenu()
  console.log('@@ what is ', selectedModelId, selectedModelFile)


  const saveSettings = async () => {
    const settings = {
      attention: stateAttention,
      performance: statePerformance,
      model: { id: selectedModelId, filename: selectedModelFile },
    }
    return services?.storage.savePlaygroundSettings({ body: settings })
  }

  const installedModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return (<SelectItem key={item.repoId} value={item.repoId}>{name}</SelectItem>)
  })

  const nativeInstalledModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return (<option key={item.repoId} value={item.repoId} label={name}>{name}</option>)
  })

  const installedFiles = installedList?.map(item => {
    if (item.repoId !== selectedModelId || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => (<SelectItem key={filename} value={filename}>{filename}</SelectItem>))
  })

  const nativeInstalledFiles = installedList?.map(item => {
    if (item.repoId !== selectedModelId || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => (<option key={filename} value={filename}>{filename}</option>))
  })

  const connectTextServiceAction = useCallback(async () => {
    const action = async () => {
      try {
        // Eject first
        await services?.textInference.unload()

        // Pass any settings data we find, We could instead pass init args from a user input, using saved settings for now.
        const settingsResponse = await services?.storage.getPlaygroundSettings()
        if (!settingsResponse?.success) {
          toast.error(`${settingsResponse?.message}`)
        }
        const response = await loadPlaygroundModel?.()
        const success = response?.success

        if (success) {
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
  }, [loadPlaygroundModel, services?.storage, services?.textInference, setIsConnecting])

  useEffect(() => {
    // If only one item we need to trigger a set state
    if (!selectedModelId && installedList?.length === 1) setSelectedModelId(installedList[0].repoId)
    // The native <select> dont actually instantiate a state value, so force one
    // else {}
  }, [installedList, selectedModelId, setSelectedModelId])

  useEffect(() => {
    if (selectedModelId && !selectedModelFile) {
      // If only one item we need to trigger a set state
      const selItem = installedList.find(i => selectedModelId === i.repoId)
      const savePaths = Object.entries(selItem?.savePath || '')
      if (savePaths?.length === 1) {
        const [filename, _path] = savePaths[0]
        setSelectedModelFile(filename)
      }
    }
  }, [installedList, selectedModelFile, selectedModelId])

  return (
    <>
      {/* Menu for Model settings */}
      <PerformanceMenu
        dialogOpen={openResponseCharmDialog}
        setDialogOpen={bool => {
          setOpenResponseCharmDialog(bool)
        }}
        onSubmit={async () => {
          await saveSettings()
          toast.success('Performance settings saved!')
          setOpenResponseCharmDialog(false)
        }}
        stateAttention={stateAttention}
        setStateAttention={setStateAttention}
        statePerformance={statePerformance}
        setStatePerformance={setStatePerformance}
        modelConfig={modelConfigs?.[selectedModelId || '']}
      />
      <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 p-1 pb-4">
        <div className="mx-auto flex w-full max-w-[48rem] flex-col gap-4">
          {/* Select a prev installed model to load */}
          <div className="w-full">
            {/* Native select */}
            <select id="model_select" onChange={({ target: { value } }) => setSelectedModelId(value)} name="Installed models" size={1} className={nativeSelectStyle} aria-labelledby="Installed models">
              <option selected disabled hidden aria-hidden>Select Ai model</option>
              {nativeInstalledModels}
            </select>
            {/* Custom select */}
            <Select
              value={selectedModelId || undefined}
              onValueChange={setSelectedModelId}
            >
              <SelectTrigger className="hidden h-fit w-full bg-accent p-4 text-lg [@media(hover:hover)]:flex">
                <SelectValue placeholder="Select Ai Model"></SelectValue>
              </SelectTrigger>
              <SelectGroup className="hidden [@media(hover:hover)]:flex">
                <SelectContent className="p-1">
                  <SelectLabel className="select-none uppercase text-indigo-500">Installed models</SelectLabel>
                  {installedModels}
                </SelectContent>
              </SelectGroup>
            </Select>
          </div>
          {/* Select a file (quant) to load for the model */}
          {selectedModelId &&
            <div className="w-full">
              {/* Native select */}
              <select id="file_select" onChange={({ target: { value } }) => setSelectedModelFile(value)} name="Available files" size={1} className={nativeSelectStyle} aria-labelledby="Available files">
                <option selected disabled hidden aria-hidden>Available files</option>
                {nativeInstalledFiles}
              </select>
              {/* Custom select */}
              <Select
                value={selectedModelFile || undefined}
                onValueChange={setSelectedModelFile}
              >
                <SelectTrigger className="hidden h-fit w-full bg-accent p-4 text-lg [@media(hover:hover)]:flex">
                  <SelectValue placeholder="Select a file"></SelectValue>
                </SelectTrigger>
                <SelectGroup className="hidden [@media(hover:hover)]:flex">
                  <SelectContent className="p-1">
                    <SelectLabel className="select-none uppercase text-indigo-500">Available files</SelectLabel>
                    {installedFiles}
                  </SelectContent>
                </SelectGroup>
              </Select>
            </div>
          }
          <div className="mb-8 mt-4 flex flex-row gap-4">
            {/* Start */}
            {selectedModelId && selectedModelFile &&
              <Button
                className="h-fit min-w-fit flex-1 bg-blue-600 p-2 text-center text-lg text-white hover:bg-blue-800"
                onClick={async () => {
                  setIsConnecting(true)
                  const isConnected = await connectTextServiceAction()
                  isConnected && setHasTextServiceConnected(true)
                  await saveSettings()
                  setIsConnecting(false)
                  router.push(`/${ROUTE_PLAYGROUND}`)
                }}
                disabled={isConnecting}
              >
                <LightningBoltIcon className="mr-1" />Start
              </Button>
            }
            {/* Model Settings Button */}
            {selectedModelId && <Button
              className="h-full flex-1 bg-accent-foreground p-2 text-lg hover:bg-accent"
              variant="outline"
              onClick={() => setOpenResponseCharmDialog(true)}>
              <MixerHorizontalIcon className="mr-1" />Settings
            </Button>}
          </div>
        </div>
      </div>
    </>
  )
}
