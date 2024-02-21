'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '@/components/ui/select'
import { T_InstalledTextModel, T_ModelConfig } from '@/lib/homebrew'

export interface I_State {
  id: string | undefined
}

interface I_Props {
  state: I_State,
  setState: Dispatch<SetStateAction<I_State>>
  installedList: T_InstalledTextModel[]
  modelConfigs: { [key: string]: T_ModelConfig }
}

export const defaultState: I_State = {
  id: undefined
}

export const ModelTab = (props: I_Props) => {
  const { installedList, modelConfigs, state, setState } = props
  const installedModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.id]
    const name = cfg?.name
    return (<SelectItem key={item.id} value={item.id}>{name}</SelectItem>)
  }) ?? []

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Choose an LLM Model</DialogTitle>
        <DialogDescription className="mb-4">
          Each model possesses unique abilities based on their training data. The size of their attention span and capability can vary so experiment with different parameter sizes and architecture types.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">

        <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 pb-4">
          <div className="flex flex-row gap-2">
            {/* Select a prev installed model to load */}
            <div className="w-full">
              <Select
                defaultValue={undefined}
                value={state.id}
                onValueChange={(val: string) => setState(prev => ({ ...prev, id: val }))}
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
          </div>
        </div>
      </div>
    </div>
  )
}