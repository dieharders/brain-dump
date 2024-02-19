'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { T_InstalledTextModel, T_ModelConfig } from '@/lib/homebrew'
import { AttentionTab, defaultState as defaultAttentionState } from '@/components/features/menus/bots/tab-attention'
import { PerformanceTab, defaultState as defaultPerformanceState } from '@/components/features/menus/bots/tab-performance'
import { ModelTab, defaultState as defaultModelState } from '@/components/features/menus/bots/tab-model'
import { SystemTab, defaultState as defaultSystemState } from '@/components/features/menus/bots/tab-system'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: any) => void
  data: { modelConfigs: { [key: string]: T_ModelConfig }, installedList: T_InstalledTextModel[], services: any }
}

export const BotCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, data } = props

  // Defaults
  const defaults = {
    attention: defaultAttentionState,
    performance: defaultPerformanceState,
    system: defaultSystemState,
    model: defaultModelState,
  }

  // State values
  const [state, setState] = useState(defaults)

  // Menus
  const promptMenu = <div>promptMenu</div>
  const systemMessageMenu = <SystemTab services={data.services} onSubmit={(form) => setState(prev => ({ ...prev, system: form }))} />
  const knowledgeMenu = <div>knowledgeMenu</div>
  const responseMenu = <div>responseMenu</div>
  const modelMenu = <ModelTab installedList={data.installedList} modelConfigs={data.modelConfigs} onSubmit={(form) => setState(prev => ({ ...prev, model: form }))} />
  const attentionMenu = <AttentionTab onSubmit={(form) => setState(prev => ({ ...prev, attention: form }))} />
  const performanceMenu = <PerformanceTab modelConfig={data.modelConfigs[state.model.id ?? '']} onSubmit={(form) => setState(prev => ({ ...prev, performance: form }))} />

  const tabs = [
    { label: 'model', content: modelMenu },
    { label: 'attention', content: attentionMenu },
    { label: 'performance', content: performanceMenu },
    { label: 'knowledge', content: knowledgeMenu },
    { label: 'personality', content: systemMessageMenu },
    { label: 'thinking', content: promptMenu }, // normal and RAG prompt templates
    { label: 'response', content: responseMenu }, // includes "accuracy"
  ]

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="min-w-[90%]">
        <Tabs label="Bot Settings" tabs={tabs} />
        <Separator className="my-6" />
        <DialogFooter className="items-stretch">
          <Button onClick={() => {
            setDialogOpen(false)
            // Save settings
            onSubmit(state)
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
