'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { I_Collection, I_ServiceApis, I_Document } from '@/lib/homebrew'
import DocumentCard from '@/components/features/cards/card-document'

interface I_Props {
  collection: I_Collection | null
  services: I_ServiceApis | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

// Show a list of documents in collection
export const DialogExploreDocuments = (props: I_Props) => {
  const { collection, services, dialogOpen, setDialogOpen } = props
  const [documents, setDocuments] = useState<I_Document[]>([])

  const fileExploreAction = async (document: I_Document) => {
    await services?.memory.fileExplore({ queryParams: { filePath: document.metadata.filePath } })
    return
  }

  const updateAction = async (document: I_Document) => {
    const res = await services?.memory.updateDocument(
      {
        body: {
          collectionName: collection?.name,
          documentName: document.metadata.name,
          documentId: document.metadata.id,
          // urlPath: document.metadata.urlPath, // optional, load from disk for now, maybe provide a toggle for disk/url
          filePath: document.metadata.filePath // optional
          // metadata: {}, // optional, if we want to upload new ones from a form
        }
      })
    if (!res?.success) toast.error(`Error ${res?.message}`)
    return
  }

  const deleteAction = async (document: I_Document, index: number) => {
    const res = await services?.memory.deleteDocuments({
      body: {
        collection_id: collection?.name,
        document_ids: [document.metadata.id],
      }
    })
    if (!res?.success) toast.error(`Error removing ${document.metadata.name}: ${res?.message}`)
    else {
      // Remove ourselves from list when successful
      const newList = [...documents]
      newList.splice(index, 1)
      setDocuments(newList)
    }
    return
  }

  // Fetch the current collection and all its' source ids
  const fetchCollection = useCallback(async () => {
    try {
      if (!collection) throw new Error('No collection specified')

      const body = { id: collection?.name }
      const res = await services?.memory.getCollection({ body })

      if (res?.success) return res?.data
      throw new Error(`Failed to fetch Collection [${collection?.name}]: ${res?.message}`)
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }, [collection, services?.memory])

  // Fetch all documents for collection
  const fetchAllDocuments = useCallback(async (document_ids: string[]): Promise<I_Document[]> => {
    try {
      if (!collection) throw new Error('No collection or document ids specified')

      const body = { collection_id: collection?.name, document_ids, include: ['documents', 'metadatas'] }
      const res = await services?.memory.getDocument({ body })
      if (!res?.success) throw new Error(`No documents found:\n${document_ids}`)

      const docs = res?.data || []
      setDocuments(docs)

      return docs
    } catch (err) {
      toast.error(`Failed to fetch documents: ${err}`)
      return []
    }
  }, [collection, services?.memory])

  const fetchAll = useCallback(async () => {
    const collection_data = await fetchCollection()
    if (!collection_data) return null

    const sources = collection_data?.collection?.metadata?.sources

    if (!sources || sources.length === 0) return null

    const res = await fetchAllDocuments(sources)
    return res
  }, [fetchAllDocuments, fetchCollection])

  // Fetch documents only when we are open and on every collection change
  useEffect(() => {
    if (dialogOpen && collection) fetchAll()
  }, [collection, dialogOpen, fetchAll])

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        {/* Title/Descr */}
        <AlertDialogHeader>
          <AlertDialogTitle className="uppercase" >{collection?.name || "Explore files in this collection"}</AlertDialogTitle>
          <AlertDialogDescription>
            Preview, update and remove files contained in this collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* Info */}
        <AlertDialogTitle>💡 Info</AlertDialogTitle>
        <AlertDialogDescription className="w-full flex-col flex-wrap items-center justify-between space-x-2">
          <div className="inline w-fit flex-1">Last Modified: {collection?.metadata?.createdAt || "???"}</div>
          <div className="inline w-fit flex-1">| Sources: {collection?.metadata?.sources?.length || 0}</div>
        </AlertDialogDescription>
        {/* Description */}
        <AlertDialogTitle >📄 Description</AlertDialogTitle>
        <AlertDialogDescription>
          {collection?.metadata?.description || "Add a detailed description of the contents..."}
        </AlertDialogDescription>
        {/* Tags */}
        <AlertDialogTitle >🔖 Tags</AlertDialogTitle>
        <AlertDialogDescription>
          {collection?.metadata?.tags || "Add hashtags to link similar memories..."}
        </AlertDialogDescription>
        {/* List of files */}
        <Separator className="my-4" />
        <div className="max-h-[32rem] flex-row items-center justify-center space-y-4 overflow-x-hidden overflow-y-scroll pr-4">
          {documents?.length > 0 ? (
            documents?.map((document, index) => <DocumentCard key={document.metadata.id} document={document} index={index} fileExploreAction={fileExploreAction} updateAction={updateAction} deleteAction={deleteAction} />)
          ) : (
            <span className="flex min-h-[6rem] w-full items-center justify-center text-center text-lg font-bold">No files uploaded yet</span>
          )}
        </div>
        <Separator className="my-4" />
        {/* Menu buttons */}
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={event => {
              event.preventDefault()
              setDialogOpen(false)
            }}
          >
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}