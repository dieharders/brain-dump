import { useCallback } from 'react'
import { I_ServiceApis } from '@/lib/homebrew'

export const usePlayground = ({ services }: { services: I_ServiceApis | null }) => {
  const fetchSettings = useCallback(async () => {
    // Load the model from settings on page mount
    const res = await services?.storage.getPlaygroundSettings()
    const s = res?.data
    return s
  }, [services?.storage])

  const loadPlaygroundModel = useCallback(async () => {
    // Load the model from the bot settings on page mount.
    const settings = await fetchSettings()
    // Make payload
    const selectedModelId = settings?.model?.id
    const mode = settings?.attention?.mode
    const initOptions = settings?.performance
    const callOptions = {
      model: 'local', // @TODO should load from a menu setting (global app setting ?)
      ...settings?.response,
    }
    const listResponse = await services?.textInference.installed()
    const installedList = listResponse?.data
    const installPath = installedList?.find(i => i.id === selectedModelId)?.savePath
    // Load LLM
    const payload = {
      modelPath: installPath,
      modelId: selectedModelId,
      mode,
      init: initOptions,
      call: callOptions,
    }
    await services?.textInference.load({ body: payload })
    // Finished
    return
  }, [fetchSettings, services?.textInference])

  return {
    ...(services && { fetchSettings }),
    ...(services && { loadPlaygroundModel }),
  }
}
