'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DocumentCard from '@/components/features/cards/card-document'
import { I_Collection, I_ServiceApis, I_Document } from '@/lib/homebrew'
import { useMemoryActions } from '@/components/features/crud/actions'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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
  const { fetchAll } = useMemoryActions(services)

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

  // Fetch documents only when we are open and on every collection change
  useEffect(() => {
    const action = async () => {
      const docs = await fetchAll(collection)
      docs && setDocuments(docs)
    }
    if (dialogOpen && collection) action()
  }, [collection, dialogOpen, fetchAll])

  // Clear documents data when menu closed
  useEffect(() => {
    if (!dialogOpen) setDocuments([])
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        {/* Title/Descr */}
        <DialogHeader>
          <DialogTitle className="mb-1 uppercase" >{collection?.name || "Explore files in this collection"}</DialogTitle>
          <DialogDescription>
            Preview, update and remove files contained in this collection.
          </DialogDescription>
        </DialogHeader>
        {/* Info */}
        <DialogTitle>💡 Info</DialogTitle>
        <DialogDescription className="w-full flex-col flex-wrap items-center justify-between space-x-4">
          <span className="w-fit">Sources: <span className="text-white">{collection?.metadata?.sources?.length || 0}</span></span>
          <span className="w-fit">Last Modified: <span className="text-white">{collection?.metadata?.createdAt || "???"}</span></span>
        </DialogDescription>
        {/* Description */}
        <DialogTitle >📄 Description</DialogTitle>
        <DialogDescription>
          {collection?.metadata?.description || "Add a detailed description of the contents..."}
        </DialogDescription>
        {/* Tags */}
        <DialogTitle >🔖 Tags</DialogTitle>
        <DialogDescription>
          {collection?.metadata?.tags || "Add hashtags to link similar memories..."}
        </DialogDescription>
        <Separator className="my-4" />
        {/* List of files */}
        <div className="flex h-full flex-col items-center justify-center space-y-4 overflow-hidden">
          {documents?.length > 0 ? (
            documents?.map((document, index) => <DocumentCard key={document.metadata.id} document={document} index={index} fileExploreAction={fileExploreAction} updateAction={updateAction} deleteAction={deleteAction} />)
          ) : (
            <span className="flex h-[6rem] w-full items-center justify-center text-center text-lg font-bold">No files uploaded yet</span>
          )}
        </div>
        <Separator className="my-4" />
        {/* Menu buttons */}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={event => {
              event.preventDefault()
              setDialogOpen(false)
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
