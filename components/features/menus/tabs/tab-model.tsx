'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { I_ModelConfigs, I_Model_State as I_State, T_InstalledTextModel } from '@/lib/homebrew'
import { Input } from '@/components/ui/input'

interface I_Props {
  state: I_State,
  setState: Dispatch<SetStateAction<I_State>>
  installedList: T_InstalledTextModel[]
  modelConfigs: I_ModelConfigs
}

export const defaultState: I_State = {
  id: undefined,
  filename: '',
  botName: '',
}

export const ModelTab = (props: I_Props) => {
  const { installedList, modelConfigs, state, setState } = props

  const installedModelsItems = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return { name: name, value: item.repoId }
  }) ?? []
  const installedModels = [{ name: 'Installed models', isLabel: true }, ...installedModelsItems]

  const installedFilesItems = installedList?.map(item => {
    if (item.repoId !== state.id || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => ({ value: filename, name: filename }))
  }).flatMap(x => x).filter(x => !!x)
  const installedFiles = [{ name: 'Available files', isLabel: true }, ...installedFilesItems]

  return (
    <div className="px-1">
      {/* Choose model */}
      <DialogHeader className="my-8">
        <DialogTitle>Choose Ai Model</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Each model can possess unique abilities depending on their training data. Their capabilities can vary so experiment with different parameters.
        </DialogDescription>
      </DialogHeader>
      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 pb-4">
          <div className="flex flex-col gap-2">
            {/* Agent Name */}
            <div className="w-full">
              <Input
                name="name"
                value={state.botName}
                placeholder="Name (3-63 lowercase chars)"
                onChange={e => {
                  let parsed = e.target.value.toLowerCase()
                  parsed = parsed.replace(/[^a-zA-Z0-9-]/g, '')
                  setState({ ...state, botName: parsed })
                }}
                className="text-md"
              />
            </div>
            {/* Select a prev installed model to load */}
            <div className="w-full">
              <Select
                id="model_select"
                placeholder="Select a model"
                name="Installed models"
                value={state.id || undefined}
                items={installedModels}
                onChange={(val) => setState((prevState) => ({ ...prevState, id: val }))}
              />
            </div>
            {/* Select a file (quant) to load for the model */}
            {state.id &&
              <div className="w-full">
                <Select
                  id="file_select"
                  placeholder="Select a file"
                  name="Available files"
                  value={state.filename || undefined}
                  items={installedFiles}
                  onChange={(val) => setState((prevState) => ({ ...prevState, filename: val }))}
                />
              </div>}
          </div>
        </div>
      </div>
    </div>
  )
}
