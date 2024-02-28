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
import { I_Attention_State, I_LLM_Init_Options, I_ModelConfigs, I_Model_State, I_PromptTemplates, I_Prompt_State, I_RAGPromptTemplates, I_Response_State, I_ServiceApis, I_System_State, I_Text_Settings, T_InstalledTextModel, useHomebrew } from '@/lib/homebrew'
import { AttentionTab, defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { PerformanceTab, defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { ModelTab, defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { SystemTab, defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { PromptTab, defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { KnowledgeTab, defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { ResponseTab, defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { useMemoryActions } from '@/components/features/crud/actions'
import { toast } from 'react-hot-toast'
import { useKnowledgeMenu } from '../charm/hook-charm-knowledge'

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
  const { fetchCollections } = useMemoryActions(data.services)
  const { getAPIConfigOptions } = useHomebrew()

  // Defaults
  const defaults: I_Text_Settings = useMemo(() => ({
    attention: defaultAttentionState,
    performance: defaultPerformanceState,
    system: defaultSystemState,
    model: defaultModelState,
    prompt: defaultPromptState,
    knowledge: defaultKnowledgeState,
    response: defaultResponse,
  }), [])

  // State values
  const {
    type: knowledgeType,
    setType: setKnowledgeType,
    selected: knowledgeIndex,
    setSelected: setKnowledgeIndex,
  } = useKnowledgeMenu()
  const [stateModel, setStateModel] = useState<I_Model_State>(defaults.model)
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(defaults.attention)
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(defaults.performance)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaults.system)
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaults.prompt)
  const [stateResponse, setStateResponse] = useState<I_Response_State>(defaults.response)

  // Prop state values
  const { disableForm, setDisableForm, collections, setCollections, checkboxes } = useKnowledgeMenu()

  // Data values
  const [promptTemplates, setPromptTemplates] = useState<I_PromptTemplates>({})
  const [ragTemplates, setRagTemplates] = useState<I_RAGPromptTemplates>({})
  const [ragModes, setRagModes] = useState<string[]>([])

  // Menus
  const promptMenu = useMemo(() => <PromptTab state={statePrompt} setState={setStatePrompt} isRAGEnabled={knowledgeType === 'augmented_retrieval'} promptTemplates={promptTemplates} ragPromptTemplates={ragTemplates} ragModes={ragModes} />, [knowledgeType, promptTemplates, ragModes, ragTemplates, statePrompt])
  const systemMessageMenu = useMemo(() => <SystemTab services={data.services} state={stateSystem} setState={setStateSystem} />, [data.services, stateSystem])
  const knowledgeMenu = useMemo(() => <KnowledgeTab type={knowledgeType} setType={setKnowledgeType} selected={knowledgeIndex} setSelected={setKnowledgeIndex} fetchListAction={fetchCollections} collections={collections} setCollections={setCollections} disableForm={disableForm} setDisableForm={setDisableForm} checkboxes={checkboxes} />, [checkboxes, collections, disableForm, fetchCollections, knowledgeType, knowledgeIndex, setCollections, setDisableForm, setKnowledgeIndex, setKnowledgeType])
  const responseMenu = useMemo(() => <ResponseTab state={stateResponse} setState={setStateResponse} />, [stateResponse])
  const modelMenu = useMemo(() => <ModelTab state={stateModel} setState={setStateModel} installedList={data.installedList} modelConfigs={data.modelConfigs} />, [data.installedList, data.modelConfigs, stateModel])
  const attentionMenu = useMemo(() => <AttentionTab state={stateAttention} setState={setStateAttention} />, [stateAttention])
  const performanceMenu = useMemo(() => <PerformanceTab state={statePerformance} setState={setStatePerformance} modelConfig={data.modelConfigs[stateModel.id ?? '']} />, [data.modelConfigs, stateModel.id, statePerformance])

  const tabs = useMemo(() => [
    { label: '🤖', title: 'LLM Model', content: modelMenu },
    { label: '👀', title: 'Attention', content: attentionMenu },
    { label: '🏃‍♂️', title: 'Performance', content: performanceMenu },
    { label: '📚', title: 'Knowledge', content: knowledgeMenu },
    { label: '🤬', title: 'Personality', content: systemMessageMenu },
    { label: '🧠', title: 'Thinking', content: promptMenu },
    { label: '🙊', title: 'Response', content: responseMenu },
  ], [attentionMenu, knowledgeMenu, modelMenu, performanceMenu, promptMenu, responseMenu, systemMessageMenu])

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
        knowledge: {
          type: knowledgeType,
          index: knowledgeIndex,
        },
        response: stateResponse,
      })
      // Close
      setDialogOpen(false)
    },
    [knowledgeType, onSubmit, knowledgeIndex, setDialogOpen, stateAttention, stateModel, statePerformance, statePrompt, stateResponse, stateSystem],
  )

  useEffect(() => {
    // Reset settings
    if (dialogOpen) {
      setKnowledgeType(defaults.knowledge.type)
      setKnowledgeIndex(defaults.knowledge.index)
      setStateModel(defaults.model)
      setStateAttention(defaults.attention)
      setStatePerformance(defaults.performance)
      setStateSystem(defaults.system)
      setStatePrompt(defaults.prompt)
      setStateResponse(defaults.response)
    }
  }, [defaults, dialogOpen, setKnowledgeIndex, setKnowledgeType])

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
