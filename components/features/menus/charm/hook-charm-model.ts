import { useCallback, useState } from 'react'
import {
  I_PromptTemplates,
  I_Prompt_State,
  I_Response_State,
  I_ServiceApis,
  I_System_State,
  T_SystemPrompts,
} from '@/lib/homebrew'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'
import { useGlobalContext } from '@/contexts'

export const useModelSettingsMenu = ({
  services,
}: {
  services: I_ServiceApis | null
}) => {
  // State values
  const { playgroundSettings } = useGlobalContext()
  const [statePrompt, setStatePrompt] = useState<I_Prompt_State>(
    playgroundSettings.prompt || defaultPromptState,
  )
  const [stateSystem, setStateSystem] = useState<I_System_State>(
    playgroundSettings.system || defaultSystemState,
  )
  const [stateResponse, setStateResponse] = useState<I_Response_State>(
    playgroundSettings.response || defaultResponse,
  )

  // Data values
  const [promptTemplates, setPromptTemplates] = useState<I_PromptTemplates>({})
  const [systemPrompts, setSystemPrompts] = useState<T_SystemPrompts>({ presets: {} })

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

  // Fetch required data for menus
  const fetchData = async () => {
    const actions = [getPromptTemplates(), getSystemPrompts()]
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
    fetchData,
  }
}
