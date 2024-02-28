import { I_Attention_State, I_LLM_Init_Options } from '@/lib/homebrew'
import { useState } from 'react'
import { defaultState as defaultAttentionState } from '@/components/features/menus/bots/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/bots/tab-performance'

// Defaults
export const defaultState = {
  attention: defaultAttentionState,
  performance: defaultPerformanceState,
}

export const usePerformanceMenu = () => {
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(
    defaultState.attention,
  )
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(
    defaultState.performance,
  )

  return {
    stateAttention,
    setStateAttention,
    statePerformance,
    setStatePerformance,
  }
}
