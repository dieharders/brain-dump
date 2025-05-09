'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { I_Attention_State, I_Knowledge_State, I_LLM_Init_Options, I_ModelConfigs, I_Model_State, I_Prompt_State, I_Response_State, I_ServiceApis, I_System_State, I_Text_Settings, T_InstalledTextModel } from '@/lib/homebrew'
import { KnowledgeTab, defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { AttentionTab, defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { PerformanceTab, defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { ModelTab, defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { SystemTab, defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { PromptTab, defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { ResponseTab, defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { ToolsTab, defaultState as defaultToolsState } from '@/components/features/menus/tabs/tab-tools'
import { useToolsMenu } from '@/components/features/menus/charm/hook-charm-tools'
import { useModelSettingsMenu } from '@/components/features/menus/charm/hook-charm-model'
import { useActions } from '@/components/features/menus/home/actions'
import { toast } from 'react-hot-toast'
import { useGlobalContext } from '@/contexts'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: I_Text_Settings) => void
  data: {
    modelConfigs: I_ModelConfigs,
    installedList: T_InstalledTextModel[],
    services: I_ServiceApis | null
  }
}

export const BotCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, data } = props
  const { playgroundSettings } = useGlobalContext()

  // Defaults
  const defaults: I_Text_Settings = useMemo(() => ({
    tools: defaultToolsState,
    attention: defaultAttentionState,
    performance: defaultPerformanceState,
    system: defaultSystemState,
    model: defaultModelState,
    prompt: defaultPromptState,
    memory: defaultKnowledgeState,
    response: defaultResponse,
  }), [])

  // State values
  const {
    selected: selectedTools,
    setSelected: setSelectedTools,
  } = useToolsMenu()
  const { fetchTools } = useActions()
  const { fetchData: fetchModelSettingsData, systemPrompts, promptTemplates } = useModelSettingsMenu({ services: data.services })
  const [stateModel, setStateModel] = useState<I_Model_State>(defaults.model)
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(defaults.attention)
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(defaults.performance)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaults.system)
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaults.prompt)
  const [stateResponse, setStateResponse] = useState<I_Response_State>(defaults.response)
  const [fetchOnce, setFetchOnce] = useState(false)
  const [stateKnowledge, setStateKnowledge] = useState<I_Knowledge_State>(
    playgroundSettings.memory || defaults.memory,
  )

  // Menus
  const knowledgeMenu = useMemo(() => <KnowledgeTab state={stateKnowledge} onSelect={setStateKnowledge} />, [stateKnowledge])
  const promptMenu = useMemo(() => <PromptTab state={statePrompt} setState={setStatePrompt} promptTemplates={promptTemplates} />, [promptTemplates, statePrompt])
  const systemMessageMenu = useMemo(() => <SystemTab state={stateSystem} setState={setStateSystem} systemPrompts={systemPrompts} />, [stateSystem, systemPrompts])
  const toolsMenu = useMemo(() => <ToolsTab fetchListAction={fetchTools} selected={selectedTools} setSelected={setSelectedTools} />, [fetchTools, selectedTools, setSelectedTools])
  const responseMenu = useMemo(() => <ResponseTab state={stateResponse} setState={setStateResponse} />, [stateResponse])
  const modelMenu = useMemo(() => <ModelTab state={stateModel} setState={setStateModel} installedList={data.installedList} modelConfigs={data.modelConfigs} />, [data.installedList, data.modelConfigs, stateModel])
  const attentionMenu = useMemo(() => <AttentionTab state={stateAttention} setState={setStateAttention} />, [stateAttention])
  const performanceMenu = useMemo(() => <PerformanceTab state={statePerformance} setState={setStatePerformance} modelConfig={data.modelConfigs[stateModel.id ?? '']} />, [data.modelConfigs, stateModel.id, statePerformance])

  const tabs = useMemo(() => [
    { icon: '🤖', label: '', key: 'Model', content: modelMenu },
    { icon: '👀', label: '', key: 'Attention', content: attentionMenu },
    { icon: '🏃‍♂️', label: '', key: 'Performance', content: performanceMenu },
    { icon: '📚', label: '', key: 'Memory', content: knowledgeMenu },
    { icon: '🛠', label: '', key: 'Tools', content: toolsMenu },
    { icon: '🤬', label: '', key: 'Personality', content: systemMessageMenu },
    { icon: '🧠', label: '', key: 'Thinking', content: promptMenu },
    { icon: '💬', label: '', key: 'Response', content: responseMenu },
  ], [attentionMenu, modelMenu, performanceMenu, promptMenu, responseMenu, systemMessageMenu, toolsMenu, knowledgeMenu])

  // Hooks
  const onSaveClick = useCallback(
    () => {
      // Check form validation
      if (!stateModel.id) {
        toast.error('Please choose an LLM model')
        return
      }
      if (!stateModel.filename) {
        toast.error('Please choose a file to load')
        return
      }
      if (!stateModel.botName) {
        toast.error('Please choose a name for your bot')
        return
      }
      // Save settings
      onSubmit({
        attention: stateAttention,
        performance: statePerformance,
        system: stateSystem,
        model: stateModel,
        prompt: statePrompt,
        tools: {
          assigned: selectedTools,
        },
        response: stateResponse,
        memory: stateKnowledge,
      })
      // Close
      setDialogOpen(false)
    },
    [stateKnowledge, onSubmit, selectedTools, setDialogOpen, stateAttention, stateModel, statePerformance, statePrompt, stateResponse, stateSystem],
  )

  useEffect(() => {
    // Reset settings
    if (dialogOpen) {
      setSelectedTools(defaults.tools?.assigned)
      setStateModel(defaults.model)
      setStateAttention(defaults.attention)
      setStatePerformance(defaults.performance)
      setStateSystem(defaults.system)
      setStatePrompt(defaults.prompt)
      setStateResponse(defaults.response)
      setStateKnowledge(defaults.memory)
    }
  }, [defaults, dialogOpen, setStateKnowledge, setSelectedTools])

  // Fetch on mount
  useEffect(() => {
    if (fetchOnce) return
    setFetchOnce(true)
    fetchModelSettingsData()
  }, [fetchOnce, fetchModelSettingsData])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:min-w-[35%]">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
        </DialogHeader>

        <Tabs
          label="ChatBot Settings"
          tabs={tabs}
        />

        <Separator className="my-6" />

        <DialogFooter className="content-center items-stretch">
          <Button onClick={onSaveClick}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
