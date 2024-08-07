import { useCallback } from "react"
import { useGlobalContext } from "@/contexts"

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
      const result = res.data.map(tool => {
        // Parse the json => object for certain props
        return {
          ...tool,
          arguments: JSON.stringify(tool.arguments, null, 2),
          example_arguments: JSON.stringify(tool.example_arguments, null, 2)
        }
      })
      // Store result
      setTools(result)
    }
    return
  }, [services?.storage, setTools])

  return {
    fetchInstalledModelsAndConfigs,
    fetchTools,
  }
}


