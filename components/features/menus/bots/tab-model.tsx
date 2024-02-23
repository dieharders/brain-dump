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
import { I_ModelConfigs, T_InstalledTextModel } from '@/lib/homebrew'
import { Input } from '@/components/ui/input'

export interface I_State {
  id: string | undefined
  botName: string
}

interface I_Props {
  state: I_State,
  setState: Dispatch<SetStateAction<I_State>>
  installedList: T_InstalledTextModel[]
  modelConfigs: I_ModelConfigs
}

export const defaultState: I_State = {
  id: undefined,
  botName: ''
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
      {/* Choose model */}
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
                onValueChange={(val: string) => setState({ ...state, id: val })}
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

      {/* Name your Bot */}
      <DialogHeader className="my-8">
        <DialogTitle>Name your Bot</DialogTitle>
      </DialogHeader>
      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 pb-4">
          <div className="flex flex-row gap-2">
            {/* Document Name */}
            <div className="w-full">
              <Input
                name="name"
                value={state.botName}
                placeholder="Name (3-63 lowercase chars)"
                onChange={e => {
                  let parsed = e.target.value.toLowerCase()
                  parsed = parsed.replace(/[^a-zA-Z0-9]/g, '')
                  setState({ ...state, botName: parsed })
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}