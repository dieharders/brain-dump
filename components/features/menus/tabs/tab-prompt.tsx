'use client'

import { Dispatch, SetStateAction } from 'react'
import { I_PromptTemplates, I_Prompt_State as I_State } from '@/lib/homebrew'
import { defaultRagTemplateState } from '@/components/features/forms/form-rag-template'
import { PromptTemplateForm, defaultPromptState } from '@/components/features/forms/form-prompt-template'
import { defaultState as defaultRagModes } from '@/components/features/forms/form-rag-strategy'

interface I_Props {
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
  promptTemplates: I_PromptTemplates
}

export const defaultState: I_State = {
  promptTemplate: defaultPromptState,
  ragTemplate: defaultRagTemplateState,
  ragMode: defaultRagModes,
}

export const PromptTab = (props: I_Props) => {
  const {
    state,
    setState,
    promptTemplates,
  } = props

  return (
    // @TODO Move this to retrieval tool creation
    //   <>
    //   <RAGTemplateForm
    //     state={state.ragTemplate}
    //     setState={val => {
    //       setState(prev => {
    //         return {
    //           promptTemplate: prev.promptTemplate,
    //           ragTemplate: val,
    //           ragMode: prev.ragMode,
    //         }
    //       })
    //     }}
    //     templates={ragPromptTemplates}
    //   />
    //   <RAGStrategyForm
    //     ragModes={ragModes}
    //     state={state.ragMode}
    //     setState={val => {
    //       setState(prev => {
    //         return {
    //           promptTemplate: prev.promptTemplate,
    //           ragTemplate: prev.ragTemplate,
    //           ragMode: val,
    //         }
    //       })
    //     }}
    //   />
    // </>
    <div className="px-1">
      <PromptTemplateForm
        templates={promptTemplates}
        state={state.promptTemplate}
        setState={val => {
          setState(prev => {
            return {
              promptTemplate: val,
              ragTemplate: prev.ragTemplate,
              ragMode: prev.ragMode,
            }
          })
        }}
      />
    </div>
  )
}
