'use client'

import { Dispatch, SetStateAction, useCallback } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { T_SystemPrompt, T_SystemPrompts, I_System_State as I_State } from '@/lib/homebrew'
import { TemplateVarsInfo } from '@/components/features/menus/tabs/info-template-vars'
import { CUSTOM_ID } from '@/components/features/forms/constants'
import { Highlight, Info } from '@/components/ui/info'

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  systemPrompts: T_SystemPrompts
}

export const defaultState: I_State = {
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
      { name: 'Custom', value: CUSTOM_ID },
      ...presets
    ]
  }, [systemPrompts?.presets])

  const onChange = (val: string) => {
    val && setState(prev => ({ ...prev, systemMessageName: val }))
    let template = ''
    if (val === CUSTOM_ID) template = state?.systemMessage || ''
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
        <div className="flex flex-row items-center gap-2">
          <DialogTitle>Ai Role</DialogTitle>
          <Info label="sys_msg" className="h-full w-6 p-1">
            <span><Highlight>system message</Highlight> A special instruction to guide the model to play a role.</span>
          </Info>
        </div>
        <DialogDescription className="text-md mb-4">
          {`Templates to override the model's behavior. Choose from pre-made templates or write your own.`}
        </DialogDescription>
      </DialogHeader>

      {/* Info about all template vars */}
      <TemplateVarsInfo />

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

      {/* System Message input */}
      <textarea
        disabled={state.systemMessageName !== CUSTOM_ID}
        className="scrollbar h-48 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.systemMessage}
        placeholder={defaultState.systemMessage}
        onChange={e => handleStateChange('systemMessage', e.target.value)}
      />
    </div>
  )
}
