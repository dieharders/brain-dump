'use client'

import { notifications } from '@/lib/notifications'
import {
  I_GenericAPIResponse,
  I_LoadedModelRes,
  I_ServiceApis,
  I_Text_Settings,
  ModelID,
} from '@/lib/homebrew'

const loadModelAction = async (
  services: I_ServiceApis | null,
  fetchSettings: (services: I_ServiceApis | null) => Promise<I_Text_Settings | undefined>,
) => {
  // Eject first
  await services?.textInference?.unload?.()
  // Fetch settings
  const settings = await fetchSettings(services)
  // Make payload
  const selectedModelId = settings?.model?.id
  const filename = settings?.model?.filename || ''
  const responseMode = settings?.attention?.response_mode
  const activeRole = settings?.attention?.active_role
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
  const res = await services?.textInference.load({
    body: {
      modelPath: installPath || '',
      modelId: selectedModelId || '',
      responseMode,
      activeRole,
      init: initOptions || {},
      call: callOptions,
    },
  })
  // Finished
  return res
}

const getModel = async (services: I_ServiceApis | null) => {
  // Ask server if a model has been loaded and store state of result
  const modelRes = await services?.textInference.model()
  const success = modelRes?.success
  return success ? modelRes : null
}

export const loadTextModel = async (
  services: I_ServiceApis | null,
  fetchSettings: () => Promise<I_Text_Settings | undefined>,
): Promise<I_GenericAPIResponse<I_LoadedModelRes>> => {
  const action = async () => {
    const res = await loadModelAction(services, fetchSettings)
    if (res?.success) {
      const modelRes = await getModel(services)
      if (modelRes?.success) return modelRes
      return Promise.reject(modelRes?.message)
    }
    return Promise.reject(res?.message)
  }
  return notifications().loadModel(action())
}
