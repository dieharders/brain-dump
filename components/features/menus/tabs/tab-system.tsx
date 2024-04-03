'use client'

import { Dispatch, SetStateAction, useCallback } from 'react'
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
} from '@/components/ui/select-custom'
import { T_SystemPrompt, T_SystemPrompts, I_System_State as I_State } from '@/lib/homebrew'

type T_TemplateSource = 'custom_default' | string

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  systemPrompts: T_SystemPrompts
}

export const defaultState = {
  systemMessage: undefined,
  systemMessageName: undefined,
}

export const SystemTab = (props: I_Props) => {
  // State values
  const { state, setState, systemPrompts } = props

  // Handle input state changes
  const handleStateChange = (propName: string, value: number | string | boolean) => {
    setState(prev => ({ ...prev, [propName]: value }))
  }

  const constructOptionsGroups = (config: { [key: string]: Array<T_SystemPrompt> }) => {
    const groups = Object.keys(config)
    return groups.map((groupName) => {
      const configs = config[groupName]
      const items = configs.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)
      return (
        <SelectGroup key={groupName}>
          <SelectLabel className="select-none">{groupName}</SelectLabel>
          {/* @TODO We should specify which templates are for "chat" or "completion" */}
          {items}
        </SelectGroup>
      )
    })
  }

  const systemPromptOptions = useCallback(() => {
    const config = systemPrompts?.presets ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Editable</SelectLabel>
        <SelectItem value="custom_default">Custom</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [systemPrompts?.presets])

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Give Your Ai Personality</DialogTitle>
        <DialogDescription className="mb-4">
          {`Every model comes with a pre-trained personality type. Choose from premade templates to override the model's behavior. Or write your own custom role description in the form below.`}
        </DialogDescription>
      </DialogHeader>

      {/* Content */}

      {/* Select where to load from */}
      <div className="mb-4 w-full">
        <Select
          value={state.systemMessageName}
          onValueChange={val => {
            val && setState(prev => ({ ...prev, systemMessageName: val as T_TemplateSource }))
            let template = ''
            if (val === 'custom_default') template = state?.systemMessage || ''
            else {
              const configs = systemPrompts?.presets ?? {}
              const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
              template = items.find(i => i.id === val)?.text || ''
            }
            if (template) setState(prev => ({ ...prev, systemMessage: template }))
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a template"></SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[16rem] p-1">
            {systemPromptOptions()}
          </SelectContent>
        </Select>
      </div>

      {/* Prompt Area */}
      <textarea
        disabled={state.systemMessageName !== 'custom_default'}
        className="scrollbar h-48 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.systemMessage}
        placeholder={defaultState.systemMessage}
        onChange={e => handleStateChange('systemMessage', e.target.value)}
      />
    </div>
  )
}
