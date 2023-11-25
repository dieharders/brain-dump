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
import {
  IconExternalLink,
  IconRefresh,
  IconTrash,
} from '@/components/ui/icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IconDocument } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Collection, I_ServiceApis, I_Document } from '@/lib/homebrew'
import Link from 'next/link'

interface I_Props {
  collection: I_Collection | null
  services: I_ServiceApis | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

// Show a list of documents in collection
export const DialogExploreDocuments = (props: I_Props) => {
  const { collection, services, dialogOpen, setDialogOpen } = props
  const [isProcessing, setIsProcessing] = useState(false)
  const [documents, setDocuments] = useState<I_Document[]>([])

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

  const BrainDocument = ({ document }: { document: I_Document }) => {
    const [isActive, setIsActive] = useState(false)

    return (
      <div
        className="relative flex-1 overflow-auto"
        onMouseEnter={() => {
          setIsActive(true)
        }}
        onMouseLeave={() => {
          setIsActive(false)
        }}
      >
        <Link
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'hover-bg-accent relative flex h-8 w-full flex-1 select-none overflow-hidden pl-8 pr-2',
          )}
          href="/"
        >
          {/* Title */}
          <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {document.metadata.name}
          </span>
          {/* Button actions */}
          {isActive && (
            <div className="flex items-center justify-between space-x-1">
              {/* File Explorer Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true)
                      await services?.memory.fileExplore({ queryParams: { filePath: document.metadata.filePath } })
                      setIsProcessing(false)
                    }}
                  >
                    <IconExternalLink />
                    <span className="sr-only">Open source file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Open file in explorer</TooltipContent>
              </Tooltip>
              {/* Update Memory Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true)
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
                      setIsProcessing(false)
                    }}
                  >
                    <IconRefresh />
                    <span className="sr-only">Update memory</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Update</TooltipContent>
              </Tooltip>
              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={async () => {
                      setIsProcessing(true)
                      const res = await services?.memory.deleteDocuments({
                        body: {
                          collection_id: collection?.name,
                          document_ids: [document.metadata.id],
                        }
                      })
                      if (!res?.success) toast.error(`Error removing ${document.metadata.name}: ${res?.message}`)
                      setIsProcessing(false)
                    }}
                  >
                    <IconTrash />
                    <span className="sr-only">Delete file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          )}
          {/* Description */}
          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {document.metadata.description}
          </p>
          {/* Tags */}
          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-left">
            {document.metadata.tags}
          </p>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute left-2 top-2 flex w-6 cursor-pointer items-center justify-center">
              <IconDocument className="mr-2" />
              <span className="sr-only">File type: document</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Document</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  // Fetch documents only when we are open and on every collection change
  useEffect(() => {
    if (dialogOpen && collection) fetchAll()
  }, [collection, dialogOpen, fetchAll])

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        {/* Title/Descr */}
        <AlertDialogHeader>
          <AlertDialogTitle>Explore files in this collection</AlertDialogTitle>
          <AlertDialogDescription>
            Preview, update and remove files contained in this collection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="my-4 md:my-8" />
        {/* List of files */}
        {documents?.length > 0 ? (
          documents?.map(doc => <BrainDocument key={doc.metadata.id} document={doc} />)
        ) : (
          <span className="flex min-h-[6rem] w-full items-center justify-center text-center text-lg font-bold">No files uploaded yet</span>
        )}
        <Separator className="my-4 md:my-8" />
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