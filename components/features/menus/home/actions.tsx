import { useCallback } from "react"
import { useGlobalContext } from "@/contexts"

export const useActions = () => {
  const { services, setInstalledList, setModelConfigs } = useGlobalContext()

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
    const result = await services?.storage.getToolSettings?.()
    return result
  }, [services?.storage])

  return {
    fetchInstalledModelsAndConfigs,
    fetchTools,
  }
}


