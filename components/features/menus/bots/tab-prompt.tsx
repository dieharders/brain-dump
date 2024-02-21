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
} from '@/components/ui/select'
import { I_PromptTemplates, I_RAGPromptTemplates, T_PromptTemplate, T_RAGPromptTemplate, T_SystemPrompt } from '@/lib/homebrew'
import { RAGTemplateForm, defaultRagTemplateState } from '@/components/features/menus/bots/form-rag-template'

export type I_State = {
  promptTemplate: T_PromptTemplate
  ragTemplate: T_RAGPromptTemplate
}

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  promptTemplates: I_PromptTemplates | undefined
  ragPromptTemplates: I_RAGPromptTemplates
  isRAGEnabled: boolean
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

export const defaultState = {
  promptTemplate: defaultPromptState,
  ragTemplate: defaultRagTemplateState
}

export const PromptTab = (props: I_Props) => {
  const { state, setState, promptTemplates, ragPromptTemplates, isRAGEnabled } = props
  const constructOptionsGroups = (config: { [key: string]: Array<T_SystemPrompt> }) => {
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

  // Handle input state changes
  const handleStateChange = (propName: string, value: number | string | boolean) => {
    setState(prev => ({ ...prev, promptTemplate: { ...prev.promptTemplate, [propName]: value } }))
  }

  const promptTemplateOptions = useCallback(() => {
    const config = promptTemplates ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Editable</SelectLabel>
        <SelectItem value={CUSTOM_ID}>{CUSTOM_NAME} (Editable)</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [promptTemplates])

  const PromptTemplateForm = () => {
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
            value={state.promptTemplate.id}
            onValueChange={val => {
              console.log('@@ prompt change:', val, ragPromptTemplates)
              let template = {} as T_PromptTemplate
              if (val === CUSTOM_ID) template = { id: CUSTOM_ID, name: CUSTOM_NAME, text: state.promptTemplate.text }
              else {
                const configs = promptTemplates ?? {}
                const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
                const t = items.find(i => i.id === val)
                if (t) template = t
              }
              if (template?.id) setState(prev => (
                {
                  promptTemplate: template,
                  ragTemplate: prev.ragTemplate,
                }
              ))
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
          disabled={state.promptTemplate.id !== CUSTOM_ID}
          className="scrollbar h-48 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
          value={state.promptTemplate.text}
          placeholder={defaultPromptState.text}
          onChange={e => handleStateChange('text', e.target.value)}
        />
      </>
    )
  }

  return (
    <div className="px-1">
      {/* RAG memory template selector */}
      {isRAGEnabled ?
        <RAGTemplateForm
          currentRagTemplate={state.ragTemplate}
          setCurrentRagTemplate={val => {
            setState(prev => {
              return {
                promptTemplate: prev.promptTemplate,
                ragTemplate: val,
              }
            })
          }}
          ragTemplates={ragPromptTemplates}
        />
        :
        <PromptTemplateForm />
      }
    </div>
  )
}