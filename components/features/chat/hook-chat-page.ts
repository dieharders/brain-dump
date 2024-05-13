import { useCallback } from 'react'
import { I_ServiceApis, ModelID } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'

export const useChatPage = ({ services }: { services: I_ServiceApis | null }) => {
  const { playgroundSettings } = useGlobalContext()
  const fetchPlaygroundSettings = useCallback(async () => {
    // Load the model from settings on page mount
    const res = await services?.storage.getPlaygroundSettings()
    const data = res?.data
    return data
  }, [services?.storage])

  const fetchChatBotSettings = useCallback(
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
    async (botName?: string) => {
      // Load the model from the bot settings on page mount
      const settings = botName ? await fetchChatBotSettings(botName) : playgroundSettings

      // Make payload
      const selectedModelId = settings?.model?.id
      const filename = settings?.model?.filename || ''
      const mode = settings?.attention?.mode
      const initOptions = settings?.performance
      const callOptions = {
        model: 'local' as ModelID, // @TODO should load from settings
        ...settings?.response,
      }
      const listResponse = await services?.textInference.installed()
      const installedList = listResponse?.data
      const installedModel = installedList?.find(i => i.repoId === selectedModelId)
      const installPath = installedModel?.savePath[filename]
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
    [fetchChatBotSettings, playgroundSettings, services?.textInference],
  )

  return {
    ...(services && { fetchPlaygroundSettings }),
    ...(services && { fetchChatBotSettings }),
    ...(services && { loadModel }),
  }
}
