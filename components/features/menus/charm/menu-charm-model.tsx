'use client'

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { PromptTab } from '@/components/features/menus/tabs/tab-prompt'
import { ResponseTab } from '@/components/features/menus/tabs/tab-response'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { SystemTab } from '@/components/features/menus/tabs/tab-system'
import { T_CharmId } from '@/components/features/menus/charm/menu-chat-charms'
import {
  I_PromptTemplates,
  I_Prompt_State,
  I_RAGPromptTemplates,
  I_Response_State,
  I_System_State,
  T_SystemPrompts,
} from '@/lib/homebrew'

export const charmId: T_CharmId = 'prompt'

export interface I_State {
  system: I_System_State,
  prompt: I_Prompt_State,
  response: I_Response_State,
}

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: I_State) => void
  stateResponse: I_Response_State
  setStateResponse: Dispatch<SetStateAction<I_Response_State>>
  stateSystem: I_System_State
  setStateSystem: Dispatch<SetStateAction<I_System_State>>
  statePrompt: I_Prompt_State
  setStatePrompt: Dispatch<SetStateAction<I_Prompt_State>>
  promptTemplates: I_PromptTemplates
  systemPrompts: T_SystemPrompts
  ragTemplates: I_RAGPromptTemplates
  ragModes: string[]
  knowledgeType: string
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const {
    dialogOpen,
    setDialogOpen,
    onSubmit,
    stateResponse,
    setStateResponse,
    stateSystem,
    setStateSystem,
    statePrompt,
    setStatePrompt,
    promptTemplates,
    systemPrompts,
    ragTemplates,
    ragModes,
    knowledgeType,
  } = props

  const onSaveClick = useCallback(
    () => {
      // Save settings
      onSubmit({
        system: stateSystem,
        prompt: statePrompt,
        response: stateResponse,
      })
      // Close
      setDialogOpen(false)
    },
    [onSubmit, setDialogOpen, statePrompt, stateResponse, stateSystem],
  )

  // Tabs
  const responseMenu = useMemo(() => <ResponseTab state={stateResponse} setState={setStateResponse} />, [setStateResponse, stateResponse])
  const promptMenu = useMemo(() => <PromptTab state={statePrompt} setState={setStatePrompt} isRAGEnabled={knowledgeType === 'augmented_retrieval'} promptTemplates={promptTemplates} ragPromptTemplates={ragTemplates} ragModes={ragModes} />, [knowledgeType, promptTemplates, ragModes, ragTemplates, setStatePrompt, statePrompt])
  const systemMessageMenu = useMemo(() => <SystemTab state={stateSystem} setState={setStateSystem} systemPrompts={systemPrompts} />, [setStateSystem, stateSystem, systemPrompts])

  const tabs = [
    { label: 'Response', title: 'Response', content: responseMenu },
    { label: 'Thinking', title: 'Thinking', content: promptMenu },
    { label: 'Personality', title: 'Personality', content: systemMessageMenu },
  ]

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <Tabs
          label="Model Settings"
          tabs={tabs}
        />

        <Separator className="my-6" />

        <DialogFooter className="content-center items-stretch">
          <Button onClick={onSaveClick}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}
