import { useCallback } from 'react'
import { I_ServiceApis, ModelID } from '@/lib/homebrew'

export const useChatBot = ({ services }: { services: I_ServiceApis | null }) => {
  const fetchSettings = useCallback(
    async (botName: string) => {
      // Load the model from the bot settings on page mount.
      const res = await services?.storage.getBotSettings()
      const settings = res?.data
      const selectedModel = settings?.find(item => item.model.botName === botName)
      return selectedModel
    },
    [services?.storage],
  )

  const loadModel = useCallback(
    async (botName: string) => {
      // Load the model from the bot settings on page mount.
      const settings = await fetchSettings(botName)
      // Make payload
      const selectedModelId = settings?.model.id
      const mode = settings?.attention.mode
      const initOptions = settings?.performance
      const callOptions = {
        model: 'local' as ModelID, // @TODO should load from settings
        ...settings?.response,
      }
      const listResponse = await services?.textInference.installed()
      const installedList = listResponse?.data
      const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
      // Load LLM
      const payload = {
        modelPath: installPath || '',
        modelId: selectedModelId || '',
        mode,
        init: initOptions || {},
        call: callOptions,
      }
      const res = await services?.textInference.load({ body: payload })
      // Finished
      return res
    },
    [fetchSettings, services?.textInference],
  )

  return {
    ...(services && { fetchSettings }),
    ...(services && { loadModel }),
  }
}
