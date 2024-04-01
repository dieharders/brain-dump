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
import { I_ModelConfigs, I_Model_State as I_State, T_InstalledTextModel } from '@/lib/homebrew'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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
  const nativeSelectStyle = cn("my-1 flex w-full rounded-md border border-accent bg-background p-4 text-lg capitalize outline-2 outline-offset-2 outline-muted focus:hover:outline [@media(hover:hover)]:hidden")
  const { installedList, modelConfigs, state, setState } = props
  const installedModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return (<SelectItem key={item.repoId} value={item.repoId}>{name}</SelectItem>)
  }) ?? []
  const nativeInstalledModels = installedList?.map(item => {
    const cfg = modelConfigs?.[item.repoId]
    const name = cfg?.name
    return (<option key={item.repoId} value={item.repoId}>{name}</option>)
  }) ?? []
  const nativeInstalledFiles = installedList?.map(item => {
    if (item.repoId !== state.id || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => (<option key={filename} value={filename}>{filename}</option>))
  })
  const installedFiles = installedList?.map(item => {
    if (item.repoId !== state.id || typeof item.savePath !== 'object') return null
    const savePaths = Object.entries(item.savePath)
    return savePaths.map(([filename, _path]) => (<SelectItem key={filename} value={filename}>{filename}</SelectItem>))
  })

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
          <div className="flex flex-col gap-2">
            {/* Select a prev installed model to load */}
            <div className="w-full">
              {/* Native select */}
              <select id="model_select" onChange={({ target: { value } }) => setState({ ...state, id: value })} name="Select Ai Model" size={1} className={nativeSelectStyle} aria-labelledby="Available files">
                <option selected disabled hidden aria-hidden>Installed models</option>
                {nativeInstalledModels}
              </select>
              {/* Custom select */}
              <Select
                value={state.id || undefined}
                onValueChange={(val: string) => setState({ ...state, id: val })}
              >
                <SelectTrigger className="hidden w-full flex-1 hover:bg-accent [@media(hover:hover)]:flex">
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
            {state.id &&
              <div className="w-full">
                {/* Native select */}
                <select id="file_select" onChange={({ target: { value } }) => setState({ ...state, filename: value })} name="Select Ai Model" size={1} className={nativeSelectStyle} aria-labelledby="Available files">
                  <option selected disabled hidden aria-hidden>Available files</option>
                  {nativeInstalledFiles}
                </select>
                {/* Custom select */}
                <Select
                  value={state.filename || undefined}
                  onValueChange={(val: string) => setState({ ...state, filename: val })}
                >
                  <SelectTrigger className="hidden w-full flex-1 hover:bg-accent [@media(hover:hover)]:flex">
                    <SelectValue placeholder="Select a file"></SelectValue>
                  </SelectTrigger>
                  <SelectGroup className="hidden [@media(hover:hover)]:flex">
                    <SelectContent className="p-1">
                      <SelectLabel className="select-none uppercase text-indigo-500">Available files</SelectLabel>
                      {installedFiles}
                    </SelectContent>
                  </SelectGroup>
                </Select>
              </div>}
          </div>
        </div>
      </div>

      {/* Name your Bot */}
      <DialogHeader className="my-8">
        <DialogTitle>Name your ChatBot</DialogTitle>
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
