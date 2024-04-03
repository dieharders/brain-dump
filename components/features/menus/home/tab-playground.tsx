'use client'

import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { MixerHorizontalIcon, LightningBoltIcon } from '@radix-ui/react-icons'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel } from "@/lib/homebrew"
import { PerformanceMenu } from '@/components/features/menus/playground/menu-performance'
import { usePerformanceMenu } from '@/components/features/menus/playground/hook-performance'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { ROUTE_PLAYGROUND } from "@/app/constants"
import { notifications } from "@/lib/notifications"

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
  const router = useRouter()
  const { loadModel: loadPlaygroundModel } = useChatPage({ services })
  const [selectedModelFile, setSelectedModelFile] = useState<string | undefined>('')
  const [openResponseCharmDialog, setOpenResponseCharmDialog] = useState(false)
  const {
    stateAttention,
    setStateAttention,
    statePerformance,
    setStatePerformance,
  } = usePerformanceMenu()

  const saveSettings = async () => {
    const settings = {
      attention: stateAttention,
      performance: statePerformance,
      model: { id: selectedModelId, filename: selectedModelFile },
    }
    return services?.storage.savePlaygroundSettings({ body: settings })
  }

  const installedModelsItems = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return { value: item.repoId, name: name }
  })
  const installedModels = [{ name: 'Installed models', isLabel: true }, ...installedModelsItems]

  const installedFilesList = installedList?.map(item => {
    if (item.repoId !== selectedModelId || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => ({ value: filename, name: filename }))
  }).flatMap(x => x).filter(val => !!val)
  const installedFiles = [{ name: 'Available files', isLabel: true }, ...installedFilesList]


  const connectTextServiceAction = useCallback(async () => {
    const action = async () => {
      try {
        // Eject first
        await services?.textInference?.unload?.()
        // Pass any settings data we find, We could instead pass init args from a user input, using saved settings for now.
        const settingsResponse = await services?.storage.getPlaygroundSettings()
        if (!settingsResponse?.success) {
          toast.error(`${settingsResponse?.message}`)
        }

        const response = await loadPlaygroundModel?.()
        const success = response?.success
        const err = response?.message

        if (success) return response

        toast.error(err || 'Failed to connect to Ai.')
        return response
      } catch (error) {
        toast.error(`${error}`)
        return
      }
    }

    setIsConnecting(true)
    const result = await action()
    setIsConnecting(false)
    return result
  }, [loadPlaygroundModel, services?.storage, services?.textInference, setIsConnecting])

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
            <Select id="model_select" placeholder="Select model" name="Installed models" value={selectedModelId} items={installedModels} onChange={setSelectedModelId} />
          </div>
          {/* Select a file (quant) to load for the model */}
          {selectedModelId &&
            <div className="w-full">
              <Select id="file_select" placeholder="Select file" name="Available files" value={selectedModelFile} items={installedFiles} onChange={setSelectedModelFile} />
            </div>
          }
          <div className="mb-8 mt-4 flex flex-row gap-4">
            {/* Start */}
            {selectedModelId && selectedModelFile &&
              <Button
                className="h-fit min-w-fit flex-1 bg-blue-600 p-2 text-center text-lg text-white hover:bg-blue-800"
                onClick={async () => {
                  setIsConnecting(true)
                  setHasTextServiceConnected(true)

                  const action = async () => {
                    const res = await connectTextServiceAction()
                    await saveSettings()
                    return res
                  }
                  await notifications().loadModel(action())

                  setIsConnecting(false)
                  router.push(ROUTE_PLAYGROUND)
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
