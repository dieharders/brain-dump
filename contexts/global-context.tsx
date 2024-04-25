import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { I_Collection, I_DocumentChunk, I_ServiceApis, I_Source } from '@/lib/homebrew'

export type T_Chunks_Map = Array<I_DocumentChunk>

interface IGlobalContextProps {
  services: I_ServiceApis | null
  setServices: (services: I_ServiceApis) => void
  downloads: any
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
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
  services: {} as I_ServiceApis,
  setServices: () => { },
  downloads: {}, // Used for tracking in progress downloads
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
})

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedCollectionName, setSelectedCollectionName] = useState<string | null>(null)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [chunks, setChunks] = useState<T_Chunks_Map>([])
  const [documents, setDocuments] = useState<Array<I_Source>>([])
  const [collections, setCollections] = useState<Array<I_Collection>>([])

  return (
    <GlobalContext.Provider
      value={{
        downloads: {},
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
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
