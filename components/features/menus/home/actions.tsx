import { useCallback } from "react"
import { useGlobalContext } from "@/contexts"
import { I_ServiceApis } from "@/lib/homebrew"

export const useActions = () => {
  const { setInstalledList, setModelConfigs } = useGlobalContext()

  const fetchInstalledModelsAndConfigs = useCallback(async (services: I_ServiceApis | null) => {
    // Get all currently installed models
    services?.textInference?.installed?.().then(listResponse =>
      listResponse?.data && setInstalledList(listResponse.data)
    )
    // Get all model configs
    services?.textInference?.getModelConfigs?.().then(cfgs =>
      cfgs?.data && setModelConfigs(cfgs.data)
    )
    return
  }, [setInstalledList, setModelConfigs])

  return {
    fetchInstalledModelsAndConfigs,
  }
}


