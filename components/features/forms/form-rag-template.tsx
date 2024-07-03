'use client'

import { useCallback } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { I_RAGPromptTemplates, T_RAGPromptTemplate } from '@/lib/homebrew'
import { TemplateVarsInfo } from '@/components/features/menus/tabs/info-template-vars'
import { CUSTOM_ID } from './constants'

const CUSTOM_NAME = 'Custom'
const defaultRagPromptText = '{context_str}\n{query_str}'
const defaultCustomType = 'CUSTOM'

interface I_Props {
  state: T_RAGPromptTemplate
  setState: (val: T_RAGPromptTemplate) => void
  templates: I_RAGPromptTemplates
}

export const defaultRagTemplateState = {
  id: CUSTOM_ID,
  name: CUSTOM_NAME,
  text: defaultRagPromptText,
  type: defaultCustomType,
}

export const RAGTemplateForm = (props: I_Props) => {
  const { state, setState, templates } = props

  const constructOptionsGroups = (config: { [key: string]: Array<T_RAGPromptTemplate> }) => {
    const groups = Object.keys(config)
    return groups.map((groupName) => {
      const configs = config[groupName]
      // @TODO We should specify which templates are for "chat" or "completion"
      const items = configs?.map(i => ({ name: i.name, value: i.id })) || []
      return [
        { name: groupName, isLabel: true },
        ...items,
      ]
    }).flatMap(x => x)
  }

  const ragPromptTemplateOptions = useCallback(() => {
    return [
      { name: CUSTOM_NAME, isLabel: true },
      { value: 'custom_default', name: `${CUSTOM_NAME} (Editable)` },
      ...constructOptionsGroups(templates),
    ]
  }, [templates])

  const onSelect = (val: string) => {
    if (val === CUSTOM_ID) {
      if (state) {
        const template = {
          id: val,
          name: CUSTOM_NAME,
          text: state.text,
          type: defaultCustomType, // hard-code since user has no way of inputting
        }
        setState(template)
      }
    }
    else {
      const items = Object.values(templates).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
      const newTemplate = items.find(i => i.id === val)
      if (newTemplate) {
        setState(newTemplate)
      }
    }
  }

  return (
    <>
      {/* Prompt Template (Chat with Memories) */}
      < DialogHeader className="my-8" >
        <DialogTitle>Memory Template</DialogTitle>
        <DialogDescription>
          When chatting with your memories, instruct and guide the Ai on how to handle your requests.
        </DialogDescription>
      </DialogHeader >

      {/* Info about all template vars */}
      <TemplateVarsInfo />

      {/* Select where to load from */}
      < div className="mb-4 w-full" >
        <Select
          id="rag_template_select"
          placeholder="Select a source"
          name="Select a source"
          value={state.id}
          items={ragPromptTemplateOptions()}
          onChange={onSelect}
        />
      </div >

      {/* Input prompt text */}
      < textarea
        disabled={state.id !== CUSTOM_ID}
        className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state.text}
        placeholder={defaultRagTemplateState.text}
        onChange={
          e => {
            if (state) {
              const newValue = { ...state, text: e.target.value }
              setState(newValue)
            }
          }
        }
      />
    </>
  )
}
