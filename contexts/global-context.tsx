import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { I_Collection, I_DocumentChunk, I_LoadedModelRes, I_ServiceApis, I_Source, I_Text_Settings } from '@/lib/homebrew'
import { defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'

export type T_Chunks_Map = Array<I_DocumentChunk>

interface IGlobalContextProps {
  services: I_ServiceApis | null
  setServices: (services: I_ServiceApis) => void
  // downloads: any
  collections: Array<I_Collection>
  setCollections: Dispatch<SetStateAction<Array<I_Collection>>>
  selectedCollectionName: string | null
  setSelectedCollectionName: (id: string) => void
  selectedDocumentId: string | null
  setSelectedDocumentId: (id: string) => void
  documents: Array<I_Source>
  setDocuments: (documents: I_Source[]) => void
  chunks: T_Chunks_Map
  setChunks: (chunks: T_Chunks_Map) => void
  playgroundSettings: I_Text_Settings
  setPlaygroundSettings: Dispatch<SetStateAction<I_Text_Settings>>
  currentModel: I_LoadedModelRes | null
  setCurrentModel: Dispatch<SetStateAction<I_LoadedModelRes | null>>
}

// Defaults
const defaultPlaygroundSettings = {
  attention: defaultAttentionState,
  performance: defaultPerformanceState,
  system: defaultSystemState,
  model: defaultModelState,
  prompt: defaultPromptState,
  knowledge: defaultKnowledgeState,
  response: defaultResponse,
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
  services: {} as I_ServiceApis,
  setServices: () => { },
  // downloads: {}, // Used for tracking in progress downloads
  collections: [],
  setCollections: () => { },
  selectedCollectionName: null,
  setSelectedCollectionName: () => { },
  selectedDocumentId: null,
  setSelectedDocumentId: () => { },
  documents: [],
  setDocuments: () => { },
  chunks: [],
  setChunks: () => { },
  playgroundSettings: defaultPlaygroundSettings,
  setPlaygroundSettings: () => { },
  currentModel: null,
  setCurrentModel: () => { },
})

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [chunks, setChunks] = useState<T_Chunks_Map>([])
  const [documents, setDocuments] = useState<Array<I_Source>>([])
  const [collections, setCollections] = useState<Array<I_Collection>>([])
  const [playgroundSettings, setPlaygroundSettings] = useState<I_Text_Settings>(defaultPlaygroundSettings)
  const [currentModel, setCurrentModel] = useState<I_LoadedModelRes | null>(null)

  return (
    <GlobalContext.Provider
      value={{
        // downloads: {},
        selectedDocumentId,
        setSelectedDocumentId,
        services,
        setServices,
        collections,
        setCollections,
        selectedCollectionName,
        setSelectedCollectionName,
        documents,
        setDocuments,
        chunks,
        setChunks,
        playgroundSettings,
        setPlaygroundSettings,
        currentModel,
        setCurrentModel,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
