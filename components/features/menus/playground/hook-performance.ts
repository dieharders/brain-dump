import { I_Attention_State, I_LLM_Init_Options } from '@/lib/homebrew'
import { useState } from 'react'
import { defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { useGlobalContext } from '@/contexts'

// Defaults
export const defaultState = {
  attention: defaultAttentionState,
  performance: defaultPerformanceState,
}

export const usePerformanceMenu = () => {
  const { playgroundSettings } = useGlobalContext()
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(
    playgroundSettings.attention || defaultState.attention,
  )
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(
    playgroundSettings.performance || defaultState.performance,
  )

  return {
    stateAttention,
    setStateAttention,
    statePerformance,
    setStatePerformance,
  }
}
