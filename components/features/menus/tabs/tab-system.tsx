'use client'

import { Dispatch, SetStateAction, useCallback } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
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
      // @TODO We should specify which templates are for "chat" or "completion"
      return [
        { name: groupName, isLabel: true },
        ...configs.map(i => ({ name: i.name, value: i.id }))
      ]
    }).flatMap(x => x)
  }

  const systemPromptOptions = useCallback(() => {
    const config = systemPrompts?.presets ?? {}
    const presets = constructOptionsGroups(config)
    return [
      { name: 'Editable', isLabel: true },
      { name: 'Custom', value: 'custom_default' },
      ...presets
    ]
  }, [systemPrompts?.presets])

  const onChange = (val: string) => {
    val && setState(prev => ({ ...prev, systemMessageName: val as T_TemplateSource }))
    let template = ''
    if (val === 'custom_default') template = state?.systemMessage || ''
    else {
      const configs = systemPrompts?.presets ?? {}
      const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
      template = items.find(i => i.id === val)?.text || ''
    }
    if (template) setState(prev => ({ ...prev, systemMessage: template }))
  }

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Give Your Ai Personality</DialogTitle>
        <DialogDescription className="mb-4">
          {`Every model comes with a pre-trained personality type. Choose from premade templates to override the model's behavior. Or write your own custom role description in the form below.`}
        </DialogDescription>
      </DialogHeader>

      {/* Select where to load from */}
      <div className="mb-4 w-full">
        <Select
          id="sys_msg_select"
          placeholder="Select a template"
          name="Select a template"
          value={state.systemMessageName || undefined}
          items={systemPromptOptions()}
          onChange={onChange}
        />
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
