'use client'

import { useCallback } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { I_PromptTemplates, T_PromptTemplate } from '@/lib/homebrew'

interface I_Props {
  state: T_PromptTemplate
  setState: (val: T_PromptTemplate) => void
  templates: I_PromptTemplates
}

// Prompt
const defaultPromptText = '{query_str}'
const CUSTOM_ID = 'custom_default'
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
        <DialogTitle>Thought Structure<p className="text-sm">(query prompt)</p></DialogTitle>
        <DialogDescription>
          Write a template to give your prompts coherant structure. Influence how the LLM thinks and determine how responses are returned. This template will wrap every query.
        </DialogDescription>
      </DialogHeader>

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

      {/* Content */}
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
