'use client'

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
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
  I_Response_State,
  I_System_State,
  T_ActiveRoles,
  T_SystemPrompts,
} from '@/lib/homebrew'
import { ToolsTab } from '@/components/features/menus/tabs/tab-tools'

export const charmId: T_CharmId = 'prompt'

type I_Tools_Selection = string[]
interface I_Tools_State {
  assigned: I_Tools_Selection
}

export interface I_State {
  system: I_System_State
  prompt: I_Prompt_State
  response: I_Response_State
  tools: I_Tools_State
}

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: I_State) => void
  fetchToolsAction: () => Promise<void>
  selectedTools: I_Tools_Selection
  setSelectedTools: Dispatch<SetStateAction<I_Tools_Selection>>
  stateResponse: I_Response_State
  setStateResponse: Dispatch<SetStateAction<I_Response_State>>
  stateSystem: I_System_State
  setStateSystem: Dispatch<SetStateAction<I_System_State>>
  statePrompt: I_Prompt_State
  setStatePrompt: Dispatch<SetStateAction<I_Prompt_State>>
  promptTemplates: I_PromptTemplates
  systemPrompts: T_SystemPrompts
  activeRole: T_ActiveRoles
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const {
    dialogOpen,
    setDialogOpen,
    onSubmit,
    fetchToolsAction,
    selectedTools,
    setSelectedTools,
    stateResponse,
    setStateResponse,
    stateSystem,
    setStateSystem,
    statePrompt,
    setStatePrompt,
    promptTemplates,
    systemPrompts,
  } = props
  const [disableForm, setDisableForm] = useState(false)

  const onSaveClick = useCallback(
    () => {
      // Save settings
      onSubmit({
        tools: { assigned: selectedTools },
        system: stateSystem,
        prompt: statePrompt,
        response: stateResponse,
      })
      // Close
      setDialogOpen(false)
    },
    [onSubmit, setDialogOpen, statePrompt, stateResponse, stateSystem, selectedTools],
  )

  // Tabs
  const toolsMenu = useMemo(() => <ToolsTab selected={selectedTools} setSelected={setSelectedTools} fetchListAction={fetchToolsAction} disableForm={disableForm} setDisableForm={setDisableForm} />, [disableForm, fetchToolsAction, setSelectedTools, selectedTools])
  const responseMenu = useMemo(() => <ResponseTab state={stateResponse} setState={setStateResponse} />, [setStateResponse, stateResponse])
  const promptMenu = useMemo(() => <PromptTab state={statePrompt} setState={setStatePrompt} promptTemplates={promptTemplates} />, [promptTemplates, setStatePrompt, statePrompt])
  const systemMessageMenu = useMemo(() => <SystemTab state={stateSystem} setState={setStateSystem} systemPrompts={systemPrompts} />, [setStateSystem, stateSystem, systemPrompts])

  const tabs = [
    { icon: '💬', label: 'Response', title: 'Response', content: responseMenu },
    { icon: '🧠', label: 'Thinking', title: 'Thinking', content: promptMenu },
    { icon: '🤬', label: 'Personality', title: 'Personality', content: systemMessageMenu },
    { icon: '🛠', label: 'Tools', title: 'Tools', content: toolsMenu },
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
