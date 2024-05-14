'use client'

import { Suspense, useEffect, useState } from 'react'
import { Session } from 'next-auth/types'
import { Panel } from '@/components/features/panels/panel'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
// import { PanelFooter } from '@/components/panel-footer'
// import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { useHomebrew } from '@/lib/homebrew'
import { DocumentCard } from '@/components/features/panels/document-card'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'
import { FileIcon } from '@radix-ui/react-icons'
import { DialogAddDocument } from '@/components/features/crud/dialog-add-document'

interface I_Props {
  session: Session
  collectionName: string | null
  fetchAction?: () => Promise<void>
}

export const DocumentsButton = ({ session, collectionName, fetchAction }: I_Props) => {
  const { getServices } = useHomebrew()
  const { addDocument, fetchDocumentChunks } = useMemoryActions()
  const { setChunks, selectedDocumentId, setSelectedDocumentId, documents, services, setServices, collections, selectedCollectionName } = useGlobalContext()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const currentCollection = collections?.find(c => c.name === collectionName) || null

  const documentCards = documents?.length ?
    documents?.map?.(
      document => {
        const docId = document?.id
        const numChunks = document?.chunkIds?.length || 0

        return (
          <DocumentCard
            key={docId}
            document={document}
            numChunks={numChunks}
            onClick={async () => {
              if (docId === selectedDocumentId) return
              docId && setSelectedDocumentId(docId)
              const res = await fetchDocumentChunks({ collectionId: selectedCollectionName, documentId: docId })
              res && setChunks(res)
            }} />
        )
      })
    : (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No Documents Found</p>
      </div>
    )

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
        <div className="mt-4 flex w-full flex-col space-y-8 overflow-y-auto">
          {/* Action Menus */}
          <DialogAddDocument
            action={addDocument}
            dialogOpen={createDialogOpen}
            setDialogOpen={setCreateDialogOpen}
            collection={currentCollection}
          />
          {/* "Add New" and "Refresh" buttons */}
          <div className="flex items-center justify-center gap-4 whitespace-nowrap px-4">
            <Button className="flex-1 text-center" onClick={() => setCreateDialogOpen(true)} >+ New Document</Button>
            <RefreshButton action={fetchAction} />
          </div>
          {/* List of documents */}
          <div className="scrollbar overflow-x-hidden pl-4 pr-2">
            <div className="flex flex-col space-y-4">
              {documentCards}
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
