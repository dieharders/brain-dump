import { useCallback, useState } from 'react'
import {
  I_PromptTemplates,
  I_Prompt_State,
  I_RAGPromptTemplates,
  I_Response_State,
  I_ServiceApis,
  I_System_State,
  T_SystemPrompts,
  useHomebrew,
} from '@/lib/homebrew'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'

export const useModelSettingsMenu = ({
  services,
}: {
  services: I_ServiceApis | null
}) => {
  // Deps
  const { getAPIConfigs } = useHomebrew()

  // State values
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaultPromptState)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaultSystemState)
  const [stateResponse, setStateResponse] = useState<I_Response_State>(defaultResponse)

  // Data values
  const [promptTemplates, setPromptTemplates] = useState<I_PromptTemplates>({})
  const [systemPrompts, setSystemPrompts] = useState<T_SystemPrompts>({ presets: {} })
  const [ragTemplates, setRagTemplates] = useState<I_RAGPromptTemplates>({})
  const [ragModes, setRagModes] = useState<string[]>([])

  // Fetch data
  const getSystemPrompts = useCallback(async () => {
    return services?.textInference
      .getSystemPrompts()
      .then(res => res?.data && setSystemPrompts(res.data))
  }, [services?.textInference])

  const getPromptTemplates = useCallback(async () => {
    const req = await services?.textInference.getPromptTemplates()
    const data = req?.data || {}
    setPromptTemplates(data)
  }, [services?.textInference])

  const getRagTemplates = useCallback(async () => {
    const req = await services?.textInference.getRagPromptTemplates()
    const data = req?.data || {}
    setRagTemplates(data)
  }, [services?.textInference])

  const getRagModes = useCallback(async () => {
    const data = await getAPIConfigs()
    setRagModes(data?.ragResponseModes || [])
  }, [getAPIConfigs])

  // Fetch required data for menus
  const fetchData = async () => {
    const actions = [
      getPromptTemplates(),
      getRagTemplates(),
      getSystemPrompts(),
      getRagModes(),
    ]
    return Promise.allSettled(actions)
  }

  return {
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
    fetchData,
  }
}
