'use client'

import { Dispatch, SetStateAction } from 'react'
import { I_PromptTemplates, I_RAGPromptTemplates, T_PromptTemplate, T_RAGPromptTemplate } from '@/lib/homebrew'
import { RAGTemplateForm, defaultRagTemplateState } from '@/components/features/menus/bots/form-rag-template'
import { PromptTemplateForm, defaultPromptState } from '@/components/features/menus/bots/form-prompt-template'

export type I_State = {
  promptTemplate: T_PromptTemplate
  ragTemplate: T_RAGPromptTemplate
}

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  promptTemplates: I_PromptTemplates
  ragPromptTemplates: I_RAGPromptTemplates
  isRAGEnabled: boolean
}

export const defaultState = {
  promptTemplate: defaultPromptState,
  ragTemplate: defaultRagTemplateState
}

export const PromptTab = (props: I_Props) => {
  const { state, setState, promptTemplates, ragPromptTemplates, isRAGEnabled } = props

  return (
    <div className="px-1">
      {/* RAG memory template selector */}
      {isRAGEnabled ?
        <RAGTemplateForm
          state={state.ragTemplate}
          setState={val => {
            setState(prev => {
              return {
                promptTemplate: prev.promptTemplate,
                ragTemplate: val,
              }
            })
          }}
          templates={ragPromptTemplates}
        />
        :
        <PromptTemplateForm
          templates={promptTemplates}
          state={state.promptTemplate}
          setState={val => {
            setState(prev => {
              return {
                promptTemplate: val,
                ragTemplate: prev.ragTemplate,
              }
            })
          }}
        />
      }
    </div>
  )
}