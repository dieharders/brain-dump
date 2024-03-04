import { useCallback } from 'react'
import { I_ServiceApis, ModelID } from '@/lib/homebrew'

export const usePlayground = ({ services }: { services: I_ServiceApis | null }) => {
  const fetchSettings = useCallback(async () => {
    // Load the model from settings on page mount
    const res = await services?.storage.getPlaygroundSettings()
    const data = res?.data
    return data
  }, [services?.storage])

  const loadModel = useCallback(async () => {
    // Load the model from the bot settings on page mount.
    const settings = await fetchSettings()
    // Make payload
    const selectedModelId = settings?.model?.id
    const mode = settings?.attention?.mode
    const initOptions = settings?.performance
    const callOptions = {
      model: 'local' as ModelID, // @TODO should load from a menu setting (global app setting ?)
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
  }, [fetchSettings, services?.textInference])

  return {
    ...(services && { fetchSettings }),
    ...(services && { loadModel }),
  }
}
