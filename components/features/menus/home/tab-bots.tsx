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
import { I_Attention_State, I_LLM_Init_Options, I_ModelConfigs, I_Model_State, I_Prompt_State, I_Response_State, I_ServiceApis, I_System_State, I_Text_Settings, T_InstalledTextModel } from '@/lib/homebrew'
import { AttentionTab, defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { PerformanceTab, defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { ModelTab, defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { SystemTab, defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { PromptTab, defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { KnowledgeTab, defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { ResponseTab, defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useKnowledgeMenu } from '@/components/features/menus/charm/hook-charm-knowledge'
import { useModelSettingsMenu } from '@/components/features/menus/charm/hook-charm-model'
import { toast } from 'react-hot-toast'

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
  const { fetchCollections } = useMemoryActions()

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
    disableForm,
    setDisableForm,
    collections,
    setCollections,
  } = useKnowledgeMenu()
  const { fetchData: fetchModelSettingsData, systemPrompts, promptTemplates, ragTemplates, ragModes } = useModelSettingsMenu({ services: data.services })
  const [stateModel, setStateModel] = useState<I_Model_State>(defaults.model)
  const [stateAttention, setStateAttention] = useState<I_Attention_State>(defaults.attention)
  const [statePerformance, setStatePerformance] = useState<I_LLM_Init_Options>(defaults.performance)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaults.system)
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaults.prompt)
  const [stateResponse, setStateResponse] = useState<I_Response_State>(defaults.response)
  const [fetchOnce, setFetchOnce] = useState(false)

  // Menus
  const promptMenu = useMemo(() => <PromptTab state={statePrompt} setState={setStatePrompt} isRAGEnabled={knowledgeType === 'augmented_retrieval'} promptTemplates={promptTemplates} ragPromptTemplates={ragTemplates} ragModes={ragModes} />, [knowledgeType, promptTemplates, ragModes, ragTemplates, statePrompt])
  const systemMessageMenu = useMemo(() => <SystemTab state={stateSystem} setState={setStateSystem} systemPrompts={systemPrompts} />, [stateSystem, systemPrompts])
  const knowledgeMenu = useMemo(() => <KnowledgeTab type={knowledgeType} setType={setKnowledgeType} selected={knowledgeIndex} setSelected={setKnowledgeIndex} fetchListAction={fetchCollections} collections={collections} setCollections={setCollections} disableForm={disableForm} setDisableForm={setDisableForm} />, [collections, disableForm, fetchCollections, knowledgeType, knowledgeIndex, setCollections, setDisableForm, setKnowledgeIndex, setKnowledgeType])
  const responseMenu = useMemo(() => <ResponseTab state={stateResponse} setState={setStateResponse} />, [stateResponse])
  const modelMenu = useMemo(() => <ModelTab state={stateModel} setState={setStateModel} installedList={data.installedList} modelConfigs={data.modelConfigs} />, [data.installedList, data.modelConfigs, stateModel])
  const attentionMenu = useMemo(() => <AttentionTab state={stateAttention} setState={setStateAttention} />, [stateAttention])
  const performanceMenu = useMemo(() => <PerformanceTab state={statePerformance} setState={setStatePerformance} modelConfig={data.modelConfigs[stateModel.id ?? '']} />, [data.modelConfigs, stateModel.id, statePerformance])

  const tabs = useMemo(() => [
    { icon: '🤖', label: '', key: 'Model', content: modelMenu },
    { icon: '👀', label: '', key: 'Attention', content: attentionMenu },
    { icon: '🏃‍♂️', label: '', key: 'Performance', content: performanceMenu },
    { icon: '📚', label: '', key: 'Knowledge', content: knowledgeMenu },
    { icon: '🤬', label: '', key: 'Personality', content: systemMessageMenu },
    { icon: '🧠', label: '', key: 'Thinking', content: promptMenu },
    { icon: '🙊', label: '', key: 'Response', content: responseMenu },
  ], [attentionMenu, knowledgeMenu, modelMenu, performanceMenu, promptMenu, responseMenu, systemMessageMenu])

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
        knowledge: {
          type: knowledgeType,
          index: knowledgeIndex,
        },
        response: stateResponse,
      })
      // Close
      setDialogOpen(false)
    },
    [stateModel, onSubmit, stateAttention, statePerformance, stateSystem, statePrompt, knowledgeType, stateResponse, knowledgeIndex, setDialogOpen],
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
          <DialogTitle>Create a ChatBot</DialogTitle>
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
