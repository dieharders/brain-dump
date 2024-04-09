import React, { ReactNode, useState } from 'react'
import { I_Collection, I_Document, I_ServiceApis } from '@/lib/homebrew'

interface IGlobalContextProps {
  services: I_ServiceApis | null
  setServices: (services: I_ServiceApis) => void
  downloads: any
  collections: Array<I_Collection>
  setCollections: (collections: Array<I_Collection>) => void
  selectedCollectionId: string | null
  setSelectedCollectionId: (id: string) => void
  selectedDocumentId: string | null
  setSelectedDocumentId: (id: string) => void
  documents: Array<I_Document>
  setDocuments: (documents: I_Document[]) => void
  documentChunks: Array<any>
  setDocumentChunks: (chunks: Array<any>) => void
}

export const GlobalContext = React.createContext<IGlobalContextProps>({
  services: {} as I_ServiceApis,
  setServices: () => { },
  downloads: {}, // Used for tracking in progress downloads
  collections: [],
  setCollections: () => { },
  selectedCollectionId: null,
  setSelectedCollectionId: () => { },
  selectedDocumentId: null,
  setSelectedDocumentId: () => { },
  documents: [],
  setDocuments: () => { },
  documentChunks: [],
  setDocumentChunks: () => { },
})

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Array<I_Document>>([])
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [collections, setCollections] = useState<Array<I_Collection>>([])
  const [documentChunks, setDocumentChunks] = useState<Array<any>>([])

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
        selectedCollectionId,
        setSelectedCollectionId,
        documents,
        setDocuments,
        documentChunks,
        setDocumentChunks,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}
