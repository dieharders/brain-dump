'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { I_Attention_State, I_LLM_Init_Options, T_ModelConfig } from '@/lib/homebrew'
import { AttentionTab } from '@/components/features/menus/tabs/tab-attention'
import { PerformanceTab } from '@/components/features/menus/tabs/tab-performance'

export type T_State = {
  attention: I_Attention_State
  performance: I_LLM_Init_Options
}

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: () => Promise<void>
  stateAttention: I_Attention_State
  setStateAttention: Dispatch<SetStateAction<I_Attention_State>>
  statePerformance: I_LLM_Init_Options
  setStatePerformance: Dispatch<SetStateAction<I_LLM_Init_Options>>
  modelConfig: T_ModelConfig | undefined
}

export const PerformanceMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, stateAttention, setStateAttention, statePerformance, setStatePerformance, modelConfig } = props

  // Tabs
  const attentionMenu = <AttentionTab state={stateAttention} setState={setStateAttention} />
  const performanceMenu = <PerformanceTab state={statePerformance} setState={setStatePerformance} modelConfig={modelConfig} />

  const tabs = [
    { icon: '👀', label: 'attention', content: attentionMenu },
    { icon: '🏃‍♂️', label: 'performance', content: performanceMenu },
  ]

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <Tabs label="Response Settings" tabs={tabs} />

        <Separator className="my-6" />

        <DialogFooter className="items-stretch">
          <Button onClick={onSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
