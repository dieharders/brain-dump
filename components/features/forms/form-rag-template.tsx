'use client'

import { useCallback } from 'react'
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
import { I_RAGPromptTemplates, T_RAGPromptTemplate } from '@/lib/homebrew'

const CUSTOM_NAME = 'Custom'
const CUSTOM_ID = 'custom_default'
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
      const items = configs?.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)
      return (
        <SelectGroup key={groupName}>
          <SelectLabel className="select-none">{groupName}</SelectLabel>
          {/* We should specify which templates are for "chat" or "completion" */}
          {items}
        </SelectGroup>
      )
    })
  }

  const ragPromptTemplateOptions = useCallback(() => {
    const presets = constructOptionsGroups(templates)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">{CUSTOM_NAME}</SelectLabel>
        <SelectItem value="custom_default">{CUSTOM_NAME} (Editable)</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [templates])

  return (
    <>
      {/* Prompt Template (Chat with Memories) */}
      < DialogHeader className="my-8" >
        <DialogTitle>Memory Template</DialogTitle>
        <DialogDescription>
          When chatting with your memories, instruct & guide the Ai on how to handle your requests.
        </DialogDescription>
      </DialogHeader >

      {/* Select where to load from */}
      < div className="mb-2 w-full" >
        <Select
          value={state.id}
          onValueChange={(val: string) => {
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
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a source"></SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[16rem] p-1">
            {ragPromptTemplateOptions()}
          </SelectContent>
        </Select>
      </div >

      {/* Content */}
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
