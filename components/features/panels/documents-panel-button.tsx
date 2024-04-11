'use client'

import { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Session } from 'next-auth/types'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
// import { SidebarFooter } from '@/components/sidebar-footer'
// import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { I_Document, useHomebrew } from '@/lib/homebrew'
import { CardDocument } from '@/components/features/panels/card-document'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'
import { FileIcon } from '@radix-ui/react-icons'
import { DialogAddDocument } from '@/components/features/crud/dialog-add-document'

interface I_Props {
  session: Session
  collectionId: string | null
}

export const DocumentsButton = ({ session, collectionId }: I_Props) => {
  const { getServices } = useHomebrew()
  const { selectedDocumentId, setSelectedDocumentId, documents, setDocuments, setDocumentChunks, services, setServices, collections } = useGlobalContext()
  const { addDocument, fetchDocumentsFromId, fetchDocumentChunks } = useMemoryActions()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Get all chunks for document
  const fetchChunksForDocument = useCallback(
    async (id: string | null, doc: I_Document) => {
      const chunkResponse = await fetchDocumentChunks(id, doc)
      chunkResponse?.length > 0 && setDocumentChunks(chunkResponse)
      return
    },
    [fetchDocumentChunks, setDocumentChunks],
  )

  const items = useMemo(() => documents?.map(
    document => (
      <CardDocument
        key={document?.metadata?.id}
        document={document}
        numChunks={JSON.parse(document?.metadata?.chunk_ids)?.length}
        onClick={async () => {
          const docId = document?.metadata?.id
          if (docId === selectedDocumentId) return
          // Reset chunks when changing docs
          setDocumentChunks([])
          // Fetch document and its chunks when selected
          setSelectedDocumentId(docId)
          fetchChunksForDocument(docId, document)
        }} />
    )
  ), [documents, fetchChunksForDocument, selectedDocumentId, setDocumentChunks, setSelectedDocumentId])

  const documentCards = documents?.length ?
    items
    : (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No Documents Found</p>
      </div>
    )

  const DocumentsList = ({ children }: { children: ReactNode }) => {
    const currentCollection = collections?.find(c => c.id === collectionId) || null

    // Fetch data when this panel is opened
    useEffect(() => {
      const action = async () => {
        const res = await fetchDocumentsFromId(collectionId)
        res && setDocuments(res)
      }
      if (!documents || documents.length === 0) action()
    }, [])

    return (
      <div className="mt-4 flex flex-col space-y-8 overflow-y-auto">
        {/* Action Menus */}
        <DialogAddDocument action={addDocument} dialogOpen={createDialogOpen} setDialogOpen={setCreateDialogOpen} collection={currentCollection} options={services?.memory.configs} />
        {/* "Add New" and "Refresh" buttons */}
        <div className="flex items-center justify-center gap-4 px-4">
          <Button className="flex-1 text-center" onClick={() => setCreateDialogOpen(true)} >+ New Document</Button>
          <RefreshButton action={async () => {
            const res = await fetchDocumentsFromId(collectionId)
            res && setDocuments(res)
          }} />
        </div>
        {/* List of documents */}
        <div className="scrollbar overflow-x-hidden pl-4 pr-2">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const action = async () => {
      const s = await getServices()
      s && setServices(s)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  return (
    <Sidebar title="Documents" icon={FileIcon}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <DocumentsList>{documentCards}</DocumentsList>
      </Suspense>
      {/* Align footer to bottom of panel */}
      {/* <SidebarFooter className="mt-auto py-8">
        <ClearData action={deleteAllDocuments} actionTitle="Delete all documents" />
      </SidebarFooter> */}
    </Sidebar>
  )
}
