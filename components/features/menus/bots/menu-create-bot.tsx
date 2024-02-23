'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { I_ModelConfigs, I_PromptTemplates, I_RAGPromptTemplates, I_ServiceApis, T_InstalledTextModel, useHomebrew } from '@/lib/homebrew'
import { AttentionTab, defaultState as defaultAttentionState, I_State as I_Attention_State } from '@/components/features/menus/bots/tab-attention'
import { PerformanceTab, defaultState as defaultPerformanceState } from '@/components/features/menus/bots/tab-performance'
import { ModelTab, defaultState as defaultModelState, I_State as I_Model_State } from '@/components/features/menus/bots/tab-model'
import { SystemTab, defaultState as defaultSystemState, I_State as I_System_State } from '@/components/features/menus/bots/tab-system'
import { PromptTab, defaultState as defaultPromptState, I_State as I_Prompt_State } from '@/components/features/menus/bots/tab-prompt'
import { KnowledgeTab, defaultState as defaultKnowledgeState, I_State as I_Knowledge_State } from '@/components/features/menus/bots/tab-knowledge'
import { ResponseTab, defaultState as defaultResponse } from '@/components/features/menus/bots/tab-response'
import { I_LLM_Init_Options, I_Response_Options } from '@/lib/hooks/types'
import { useMemoryActions } from '@/components/features/crud/actions'
import { toast } from 'react-hot-toast'

export interface I_Settings {
  attention: I_Attention_State,
  performance: I_LLM_Init_Options,
  system: I_System_State,
  model: I_Model_State,
  prompt: I_Prompt_State,
  knowledge: I_Knowledge_State,
  response: I_Response_Options,
}

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: I_Settings) => void
  data: {
    modelConfigs: I_ModelConfigs,
    installedList: T_InstalledTextModel[],
    services: I_ServiceApis | null
  }
}

export const BotCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, data } = props
  const { fetchCollections } = useMemoryActions(data.services)
  const { getAPIConfigOptions } = useHomebrew()

  // Defaults
  const defaults: I_Settings = useMemo(() => ({
    attention: defaultAttentionState,
    performance: defaultPerformanceState,
    system: defaultSystemState,
    model: defaultModelState,
    prompt: defaultPromptState,
    knowledge: defaultKnowledgeState,
    response: defaultResponse,
  }), [])

  // State values
  const [stateKnowledge, setStateKnowledge] = useState<I_Knowledge_State>(defaults.knowledge)
  const [stateModel, setStateModel] = useState<I_Model_State>(defaults.model)
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(defaults.attention)
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(defaults.performance)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaults.system)
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaults.prompt)
  const [stateResponse, setStateResponse] = useState<I_Response_Options>(defaults.response)

  // Data values
  const [promptTemplates, setPromptTemplates] = useState<I_PromptTemplates>({})
  const [ragTemplates, setRagTemplates] = useState<I_RAGPromptTemplates>({})
  const [ragModes, setRagModes] = useState<string[]>([])

  // Menus
  const promptMenu = <PromptTab state={statePrompt} setState={setStatePrompt} isRAGEnabled={stateKnowledge.type === 'augmented_retrieval'} promptTemplates={promptTemplates} ragPromptTemplates={ragTemplates} ragModes={ragModes} />
  const systemMessageMenu = <SystemTab services={data.services} state={stateSystem} setState={setStateSystem} />
  const knowledgeMenu = <KnowledgeTab state={stateKnowledge} setState={setStateKnowledge} fetchListAction={fetchCollections} />
  const responseMenu = <ResponseTab state={stateResponse} setState={setStateResponse} />
  const modelMenu = <ModelTab state={stateModel} setState={setStateModel} installedList={data.installedList} modelConfigs={data.modelConfigs} />
  const attentionMenu = <AttentionTab state={stateAttention} setState={setStateAttention} />
  const performanceMenu = <PerformanceTab state={statePerformance} setState={setStatePerformance} modelConfig={data.modelConfigs[stateModel.id ?? '']} />

  const tabs = [
    { label: '🤖', title: 'LLM Model', content: modelMenu },
    { label: '👀', title: 'Attention', content: attentionMenu },
    { label: '🏃‍♂️', title: 'Performance', content: performanceMenu },
    { label: '📚', title: 'Knowledge', content: knowledgeMenu },
    { label: '🤬', title: 'Personality', content: systemMessageMenu },
    { label: '🧠', title: 'Thinking', content: promptMenu },
    { label: '🙊', title: 'Response', content: responseMenu },
  ]

  // Fetch data
  const fetchPromptTemplates = useCallback(async () => data.services?.textInference.getPromptTemplates(), [data.services?.textInference])
  const fetchRagTemplates = useCallback(async () => data.services?.textInference.getRagPromptTemplates(), [data.services?.textInference])
  const fetchRagModes = useCallback(async () => getAPIConfigOptions(), [getAPIConfigOptions])

  // Hooks
  const onSaveClick = useCallback(
    () => {
      // Check form validation
      if (!stateModel.id) {
        toast.error('Please choose an LLM model')
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
        knowledge: stateKnowledge,
        response: stateResponse,
      })
      // Close
      setDialogOpen(false)
    },
    [onSubmit, setDialogOpen, stateAttention, stateKnowledge, stateModel, statePerformance, statePrompt, stateResponse, stateSystem],
  )

  useEffect(() => {
    // Reset settings
    if (dialogOpen) {
      setStateKnowledge(defaults.knowledge)
      setStateModel(defaults.model)
      setStateAttention(defaults.attention)
      setStatePerformance(defaults.performance)
      setStateSystem(defaults.system)
      setStatePrompt(defaults.prompt)
      setStateResponse(defaults.response)
    }
  }, [defaults, dialogOpen])

  // Fetch data
  useEffect(() => {
    const getPromptTemplates = async () => {
      const req = await fetchPromptTemplates()
      const data = req?.data || {}
      setPromptTemplates(data)
    }
    const getRagTemplates = async () => {
      const req = await fetchRagTemplates()
      const data = req?.data || {}
      setRagTemplates(data)
    }
    const getRagModes = async () => {
      const data = await fetchRagModes()
      setRagModes(data?.ragResponseModes || [])
    }
    getPromptTemplates()
    getRagTemplates()
    getRagModes()
  }, [fetchPromptTemplates, fetchRagModes, fetchRagTemplates])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:min-w-[35%]">
        <Tabs
          className="text-2xl"
          label="Bot Settings"
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
