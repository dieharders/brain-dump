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
  const { getAPIConfigOptions } = useHomebrew()

  // State values
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(defaultPromptState)
  const [stateSystem, setStateSystem] = useState<I_System_State>(defaultSystemState)
  const [stateResponse, setStateResponse] = useState<I_Response_State>(defaultResponse)

  // Data values
  const [promptTemplates, setPromptTemplates] = useState<I_PromptTemplates>({})
  const [systemPrompts, setSystemPrompts] = useState<T_SystemPrompts>({ presets: {} })
  const [ragTemplates, setRagTemplates] = useState<I_RAGPromptTemplates>({})
  const [ragModes, setRagModes] = useState<string[]>([])

  // API
  const fetchRagModes = useCallback(
    async () => getAPIConfigOptions(),
    [getAPIConfigOptions],
  )
  const fetchPromptTemplates = useCallback(
    async () => services?.textInference.getPromptTemplates(),
    [services?.textInference],
  )
  const fetchRagPromptTemplates = useCallback(
    async () => services?.textInference.getRagPromptTemplates(),
    [services?.textInference],
  )
  const fetchSystemPrompts = useCallback(
    async () => services?.textInference.getSystemPrompts(),
    [services?.textInference],
  )

  // Fetch data
  const getSystemPrompts = useCallback(async () => {
    return fetchSystemPrompts().then(res => res?.data && setSystemPrompts(res.data))
  }, [fetchSystemPrompts])
  const getPromptTemplates = useCallback(async () => {
    const req = await fetchPromptTemplates()
    const data = req?.data || {}
    setPromptTemplates(data)
  }, [fetchPromptTemplates])
  const getRagTemplates = useCallback(async () => {
    const req = await fetchRagPromptTemplates()
    const data = req?.data || {}
    setRagTemplates(data)
  }, [fetchRagPromptTemplates])
  const getRagModes = useCallback(async () => {
    const data = await fetchRagModes()
    setRagModes(data?.ragResponseModes || [])
  }, [fetchRagModes])

  // Fetch required data for menus
  const fetchData = async () => {
    const actions = [
      getPromptTemplates(),
      getRagTemplates(),
      getSystemPrompts(),
      getRagModes(),
    ]
    await Promise.allSettled(actions)
    return
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
