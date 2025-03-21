'use client'

import { Dispatch, SetStateAction } from 'react'
import { I_PromptTemplates, I_Prompt_State as I_State } from '@/lib/homebrew'
import { PromptTemplateForm, defaultPromptState } from '@/components/features/forms/form-prompt-template'

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  promptTemplates: I_PromptTemplates
}

export const defaultState: I_State = {
  promptTemplate: defaultPromptState,
}

export const PromptTab = (props: I_Props) => {
  const {
    state,
    setState,
    promptTemplates,
  } = props

  return (
    <div className="px-1">
      <PromptTemplateForm
        templates={promptTemplates}
        state={state.promptTemplate}
        setState={val => {
          setState(prev => {
            return {
              ...prev,
              promptTemplate: val
            }
          })
        }}
      />
    </div>
  )
}
