'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Session } from 'next-auth/types'
import { Panel } from '@/components/features/panels/panel'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
// import { PanelFooter } from '@/components/panel-footer'
// import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { I_Source, useHomebrew } from '@/lib/homebrew'
import { DocumentCard } from '@/components/features/panels/document-card'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'
import { FileIcon } from '@radix-ui/react-icons'
import { DialogAddDocument } from '@/components/features/crud/dialog-add-document'
import { CardButtons } from '@/components/features/panels/panel-card-buttons'

interface I_Props {
  session: Session | undefined
  collectionName: string | null
  fetchAction?: () => Promise<void>
}

export const DocumentsButton = ({ session, collectionName, fetchAction }: I_Props) => {
  const { getServices } = useHomebrew()
  const { addDocument, updateDocument, fetchDocumentChunks, copyId, deleteSource } = useMemoryActions()
  const { setChunks, selectedDocumentId, setSelectedDocumentId, documents, services, setServices, collections, selectedCollectionName, setDocuments } = useGlobalContext()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const currentCollection = collections?.find(c => c.name === collectionName) || null
  const currentSelectedDocument = documents.find(d => selectedDocumentId === d.id)
  const docBehavior = useRef<undefined | I_Source>(undefined)

  const emptyDocuments = (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">No Documents Found</p>
    </div>
  )

  const getDocuments = useCallback(() => documents?.map?.(
    document => {
      const docId = document?.id
      const numChunks = document?.chunkIds?.length || 0

      return (
        <DocumentCard
          key={docId}
          document={document}
          numChunks={numChunks}
          isActive={docId === selectedDocumentId}
          onClick={async () => {
            if (docId === selectedDocumentId) return
            docId && setSelectedDocumentId(docId)
            const res = await fetchDocumentChunks({ collectionId: selectedCollectionName, documentId: docId })
            res && setChunks(res)
          }}>
          <CardButtons
            editAction={() => {
              docBehavior.current = currentSelectedDocument
              setCreateDialogOpen(true)
            }}
            onDeleteAction={async () => {
              await deleteSource(selectedCollectionName || '', document)
              // Reset data
              setSelectedDocumentId('')
              // Re-fetch sources
              fetchAction && await fetchAction()
              return true
            }}
            copyId={() => copyId(document?.id)}
          />
        </DocumentCard>
      )
    }), [copyId, currentSelectedDocument, deleteSource, documents, fetchAction, fetchDocumentChunks, selectedCollectionName, selectedDocumentId, setChunks, setSelectedDocumentId])

  useEffect(() => {
    const action = async () => {
      const s = await getServices()
      s && setServices(s)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  return (
    <Panel title="Documents" icon={FileIcon} onClick={fetchAction}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <div className="my-4 flex w-full flex-col space-y-8 overflow-y-auto">
          {/* Action Menus */}
          <DialogAddDocument
            action={docBehavior.current ? updateDocument : addDocument}
            dialogOpen={createDialogOpen}
            setDialogOpen={setCreateDialogOpen}
            collection={currentCollection}
            document={docBehavior.current}
          />
          {/* "Add New" and "Refresh" buttons */}
          <div className="flex items-center justify-center gap-4 overflow-hidden whitespace-nowrap px-4 py-2">
            <Button className="flex-1 truncate text-center" onClick={() => {
              setCreateDialogOpen(true)
              docBehavior.current = undefined
            }} >+ New Document</Button>
            <RefreshButton action={fetchAction} />
          </div>
          {/* List of documents */}
          <div className="scrollbar overflow-x-hidden pl-4 pr-2">
            <div className="flex flex-col space-y-4">
              {documents?.length ? getDocuments() : emptyDocuments}
            </div>
          </div>
        </div>

      </Suspense>
      {/* Align footer to bottom of panel */}
      {/* <PanelFooter className="mt-auto py-8">
        <ClearData action={deleteAllDocuments} actionTitle="Delete all documents" />
      </PanelFooter> */}
    </Panel>
  )
}
