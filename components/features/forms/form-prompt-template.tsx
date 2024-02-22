'use client'

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
import { I_PromptTemplates, T_PromptTemplate } from '@/lib/homebrew'
import { useCallback } from 'react'

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
      const configs = config[groupName]
      const items = configs.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)
      return (
        <SelectGroup key={groupName}>
          <SelectLabel className="select-none">{groupName}</SelectLabel>
          {/* We should specify which templates are for "chat" or "completion" */}
          {items}
        </SelectGroup>
      )
    })
  }

  const promptTemplateOptions = useCallback(() => {
    const config = templates ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Editable</SelectLabel>
        <SelectItem value={CUSTOM_ID}>{CUSTOM_NAME} (Editable)</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [templates])

  return (
    <>
      {/* Prompt Template (Normal chat) */}
      <DialogHeader className="my-8">
        <DialogTitle>Thought Structure</DialogTitle>
        <DialogDescription>
          Write a template to give your prompts coherant structure. Influence how the LLM thinks and determine how responses are returned. This template will wrap every query.
        </DialogDescription>
      </DialogHeader>

      {/* Select where to load from */}
      <div className="mb-4 w-full">
        <Select
          value={state.id}
          onValueChange={val => {
            let template = {} as T_PromptTemplate
            if (val === CUSTOM_ID) template = { id: CUSTOM_ID, name: CUSTOM_NAME, text: state.text }
            else {
              const configs = templates ?? {}
              const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
              const t = items.find(i => i.id === val)
              if (t) template = t
            }
            if (template?.id) setState(template)
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a template"></SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[16rem] p-1">
            {promptTemplateOptions()}
          </SelectContent>
        </Select>
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
