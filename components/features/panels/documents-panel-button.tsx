'use client'

import { ReactNode, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Session } from 'next-auth/types'
import { toast } from 'react-hot-toast'
import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/clear-data'
import { I_Collection, useHomebrew } from '@/lib/homebrew'
import { CardDocument } from '@/components/features/panels/card-document'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'
import { FileIcon } from '@radix-ui/react-icons'

interface I_Props {
  session: Session
  collectionId: string | null
}

export const DocumentsButton = ({ session, collectionId }: I_Props) => {
  const { getServices } = useHomebrew()
  const { setSelectedDocumentId, documents, setDocuments, documentChunks, setDocumentChunks, services, setServices, collections } = useGlobalContext()
  const { fetchDocuments, fetchCollections, fetchDocumentChunks } = useMemoryActions()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const numChunks = documentChunks?.length || 0

  // Get all chunks for document
  const fetchChunksForDocument = useCallback(
    async (id: string | null, doc: any) => {
      const chunkResponse = await fetchDocumentChunks(id, doc)
      chunkResponse.length > 0 && setDocumentChunks(chunkResponse)
    },
    [fetchDocumentChunks, setDocumentChunks],
  )

  const items = useMemo(() => documents?.map(
    document => (
      <CardDocument
        key={document?.metadata?.id}
        document={document}
        numChunks={numChunks}
        onClick={() => {
          // Fetch document and its chunks when selected
          setSelectedDocumentId(document?.metadata?.id)
          const coll = collections.find(c => c.id === collectionId)
          const collectionName = coll?.name || null
          fetchChunksForDocument(collectionName, document)
        }} />
    )
  ), [collectionId, collections, documents, fetchChunksForDocument, numChunks, setSelectedDocumentId])

  const documentCards = documents?.length ?
    items
    : (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No Documents Found</p>
      </div>
    )

  /**
   * @TODO Delete all documents in this collection or delete entire collection ?
   */
  const clearDocuments = async () => {
    try {
      const result = await services?.memory.wipe()
      if (!result?.success) throw new Error(result?.message)
      toast.success('All documents successfully removed')
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

  const updateAction = useCallback(async () => {
    try {
      const allCollections = await fetchCollections()
      const currentCollection = allCollections.find((c: I_Collection) => c.id === collectionId)
      const documentsResponse = await fetchDocuments(currentCollection)

      if (documentsResponse?.length === 0) throw new Error('Failed to fetch documents.')
      documentsResponse && setDocuments(documentsResponse)

      return documentsResponse
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return
    }
  }, [collectionId, fetchCollections, fetchDocuments, setDocuments])

  const DocumentsList = ({ children }: { children: ReactNode }) => {
    // Fetch data when this panel is opened
    useEffect(() => {
      const action = async () => {
        const res = await updateAction()
        res && setDocuments(res as any)
      }
      if (!documents || documents.length === 0) action()
    }, [])

    return (
      <div className="mt-4 flex flex-col space-y-8 overflow-y-auto">
        {/* "Add New" and "Refresh" buttons */}
        <div className="flex items-center justify-center gap-4 px-4">
          <Button className="flex-1 text-center" onClick={() => setCreateDialogOpen(true)} >+ New Document</Button>
          <RefreshButton action={updateAction} />
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
      <SidebarFooter className="mt-auto py-8">
        <ClearData clearAction={clearDocuments} actionTitle="Delete all documents" />
      </SidebarFooter>
    </Sidebar>
  )
}
