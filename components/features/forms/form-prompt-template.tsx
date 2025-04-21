'use client'

import { useCallback } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { I_PromptTemplates, T_PromptTemplate } from '@/lib/homebrew'
import { TemplateVarsInfo } from '@/components/features/menus/tabs/info-template-vars'
import { CUSTOM_ID } from './constants'
import { Highlight, Info } from '@/components/ui/info'

interface I_Props {
  state: T_PromptTemplate
  setState: (val: T_PromptTemplate) => void
  templates: I_PromptTemplates
}

// Prompt
const defaultPromptText = '{{user_prompt}}'
const CUSTOM_NAME = 'Custom'

export const defaultPromptState = {
  id: CUSTOM_ID,
  name: CUSTOM_NAME,
  text: defaultPromptText,
}

export const PromptTemplateForm = (props: I_Props) => {
  const { state, setState, templates } = props

  const constructOptionsGroups = (config: { [key: string]: Array<T_PromptTemplate> }) => {
    const groups = Object.keys(config)
    return groups.map((groupName) => {
      const configs = config?.[groupName]
      // @TODO We should specify which templates are for "chat" or "completion"
      const items = configs?.map(i => ({ name: i.name, value: i.id }))
      return [
        { name: groupName, isLabel: true },
        ...items
      ]
    }).flatMap(x => x)
  }

  const promptTemplateOptions = useCallback(() => {
    const config = templates ?? {}
    const presets = constructOptionsGroups(config)
    return [
      { name: 'Editable', isLabel: true },
      { name: `${CUSTOM_NAME} (Editable)`, value: CUSTOM_ID },
      ...presets
    ]
  }, [templates])

  const onChange = (val: string) => {
    let template = {} as T_PromptTemplate
    if (val === CUSTOM_ID) template = { id: CUSTOM_ID, name: CUSTOM_NAME, text: state.text }
    else {
      const configs = templates ?? {}
      const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
      const t = items.find(i => i.id === val)
      if (t) template = t
    }
    if (template?.id) setState(template)
  }

  return (
    <>
      {/* Prompt Template (Normal chat) */}
      <DialogHeader className="my-8">
        <div className="flex flex-row items-center gap-2">
          <DialogTitle>Thought Structure</DialogTitle>
          <Info label="prompt template" className="h-full w-6 p-1">
            <span><Highlight>prompt template</Highlight> The prompt is injected into the template, giving structure to the Ai response.</span>
          </Info>
        </div>
        <DialogDescription>
          Structure your query in a way that affects how the Ai thinks and responds. Choose from pre-made templates or write your own.
        </DialogDescription>
      </DialogHeader>

      {/* Info about all template vars */}
      <TemplateVarsInfo />

      {/* Select where to load from */}
      <div className="mb-4 w-full">
        <Select
          id="prompt_select"
          placeholder="Select a template"
          name="Select a template"
          value={state.id || undefined}
          items={promptTemplateOptions()}
          onChange={onChange}
        />
      </div>

      {/* Input prompt text */}
      <textarea
        disabled={state.id !== CUSTOM_ID}
        className="scrollbar h-48 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state.text}
        placeholder={defaultPromptState.text}
        onChange={e => {
          setState({ ...state, text: e.target.value })
        }}
      />
    </>
  )
}
