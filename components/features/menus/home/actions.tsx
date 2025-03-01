import { useCallback } from 'react'
import { useGlobalContext } from '@/contexts'

export const useActions = () => {
  const { services, setInstalledList, setModelConfigs, setTools } = useGlobalContext()

  const fetchInstalledModelsAndConfigs = useCallback(async () => {
    // Get all currently installed models
    services?.textInference?.installed?.().then(listResponse =>
      listResponse?.data && setInstalledList(listResponse.data)
    )
    // Get all model configs
    services?.textInference?.getModelConfigs?.().then(cfgs =>
      cfgs?.data && setModelConfigs(cfgs.data)
    )
    return
  }, [services?.textInference, setInstalledList, setModelConfigs])

  const fetchTools = useCallback(async () => {
    const res = await services?.storage.getToolSettings?.()
    if (res?.success && res.data) {
      // Store result
      setTools(res.data)
    }
    return
  }, [services?.storage, setTools])

  return {
    fetchInstalledModelsAndConfigs,
    fetchTools,
  }
}


