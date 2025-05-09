import { createContext, Dispatch, MutableRefObject, ReactNode, SetStateAction, useRef, useState } from 'react'
import { I_Collection, I_DocumentChunk, I_LoadedModelRes, I_Message, I_ModelConfigs, I_ServiceApis, I_Source, I_Text_Settings, I_Thread, I_Tool_Definition, T_InstalledTextModel } from '@/lib/homebrew'
import { defaultState as defaultAttentionState } from '@/components/features/menus/tabs/tab-attention'
import { defaultState as defaultPerformanceState } from '@/components/features/menus/tabs/tab-performance'
import { defaultState as defaultModelState } from '@/components/features/menus/tabs/tab-model'
import { defaultState as defaultSystemState } from '@/components/features/menus/tabs/tab-system'
import { defaultState as defaultPromptState } from '@/components/features/menus/tabs/tab-prompt'
import { defaultState as defaultToolsState } from '@/components/features/menus/tabs/tab-tools'
import { defaultState as defaultKnowledgeState } from '@/components/features/menus/tabs/tab-knowledge'
import { defaultState as defaultResponse } from '@/components/features/menus/tabs/tab-response'

export type T_Chunks_Map = Array<I_DocumentChunk>

interface IGlobalContextProps {
  services: I_ServiceApis | null
  setServices: (services: I_ServiceApis) => void
  // downloads: any
  tools: I_Tool_Definition[]
  setTools: Dispatch<SetStateAction<I_Tool_Definition[]>>
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
  installedList: T_InstalledTextModel[],
  setInstalledList: Dispatch<SetStateAction<T_InstalledTextModel[]>>
  modelConfigs: I_ModelConfigs
  setModelConfigs: Dispatch<SetStateAction<I_ModelConfigs>>
  isAiThinking: boolean
  setIsAiThinking: Dispatch<SetStateAction<boolean>>
  threads: Array<I_Thread>
  setThreads: Dispatch<SetStateAction<Array<I_Thread>>>
  currentThreadId: MutableRefObject<string>
  currentMessages: Array<I_Message>,
  setCurrentMessages: Dispatch<SetStateAction<Array<I_Message>>>,
  eventState: string,
  setEventState: Dispatch<SetStateAction<string>>,
}

// Defaults
const defaultPlaygroundSettings = {
  tools: defaultToolsState,
  attention: defaultAttentionState,
  memory: defaultKnowledgeState,
  performance: defaultPerformanceState,
  system: defaultSystemState,
  model: defaultModelState,
  prompt: defaultPromptState,
  response: defaultResponse,
}

export const GlobalContext = createContext<IGlobalContextProps>({} as IGlobalContextProps)

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [chunks, setChunks] = useState<T_Chunks_Map>([])
  const [documents, setDocuments] = useState<Array<I_Source>>([])
  const [collections, setCollections] = useState<Array<I_Collection>>([])
  const [playgroundSettings, setPlaygroundSettings] = useState<I_Text_Settings>(defaultPlaygroundSettings)
  const [currentModel, setCurrentModel] = useState<I_LoadedModelRes | null>(null)
  const [installedList, setInstalledList] = useState<T_InstalledTextModel[]>([])
  const [modelConfigs, setModelConfigs] = useState<I_ModelConfigs>({})
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [threads, setThreads] = useState<Array<I_Thread>>([])
  const currentThreadId = useRef('')
  const [currentMessages, setCurrentMessages] = useState<Array<I_Message>>([])
  const [tools, setTools] = useState<I_Tool_Definition[]>([])
  const [eventState, setEventState] = useState<string>('STARTING...')

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
        installedList,
        setInstalledList,
        modelConfigs,
        setModelConfigs,
        isAiThinking,
        setIsAiThinking,
        threads,
        setThreads,
        currentThreadId,
        currentMessages,
        setCurrentMessages,
        tools,
        setTools,
        eventState,
        setEventState,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
