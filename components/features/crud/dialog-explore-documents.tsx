'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  IconOpenAI,
  IconRefresh,
  IconTrash,
} from '@/components/ui/icons'
import { Brain, T_Chunk } from '@/lib/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { IconDocument } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_ServiceApis } from '@/lib/homebrew'
import { toast } from 'react-hot-toast'

interface I_Props {
  collection: Brain | null
  apis: I_ServiceApis | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

// Show a list of documents in collection
export const DialogExploreDocuments = (props: I_Props) => {
  const { collection, apis, dialogOpen, setDialogOpen } = props
  const [isProcessing, setIsProcessing] = useState(false)
  const [documents, setDocuments] = useState<T_Chunk[]>([])

  // Fetch the current collection and all its' document ids
  const fetchCollection = useCallback(async () => {
    try {
      if (!collection) throw new Error('No collection specified')

      const body = { id: collection?.name }
      const res = await apis?.memory.getCollection({ body })

      const document_ids = res?.data?.documents.ids
      if (res?.success && document_ids.length) {
        return document_ids
      }
      throw new Error(`Failed to fetch Collection ${collection?.name}`)
    } catch (err) {
      return false
    }
  }, [apis?.memory, collection])

  // Fetch all documents for collection (actually returning the chunks of the document)
  const fetchAllDocuments = useCallback(async (docIds: string[]) => {
    try {
      if (!collection) throw new Error('No collection or document ids specified')

      const body = { collection_id: collection?.name, document_ids: docIds }
      const res = await apis?.memory.getDocument({ body })
      const len = res?.data?.documents.length
      const parsedDocs = []

      if (!res?.success || !len || len === 0) throw new Error(`No documents found:\n${docIds}`)

      for (let index = 0; index < len; index++) {
        const metadata = res?.data?.metadatas?.[index]
        metadata._node_content = JSON.parse(metadata?._node_content || '')

        parsedDocs.push({
          id: res?.data?.ids?.[index],
          document: res?.data?.documents?.[index],
          embedding: res?.data?.embeddings?.[index],
          metadata, // @TODO Add a document_name field to document metadata
        })
      }

      setDocuments(parsedDocs)
      return parsedDocs
    } catch (err) {
      toast.error(`Failed to fetch documents: ${err}`)
      return false
    }
  }, [apis?.memory, collection])

  const fetchAll = useCallback(async () => {
    const docIds = await fetchCollection()

    if (!docIds || docIds.length === 0) return false

    const res = await fetchAllDocuments(docIds)
    return res
  }, [fetchAllDocuments, fetchCollection])

  const BrainDocument = ({ file }: { file: T_Chunk }) => {
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
            {file.metadata.document_name}
          </span>
          {/* Button actions */}
          {isActive && (
            <div className="flex items-center justify-between space-x-1">
              {/* Context Template Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={() => {
                      // @TODO
                      setIsProcessing(true)
                    }}
                  >
                    <IconOpenAI />
                    <span className="sr-only">Add context template</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add context template</TooltipContent>
              </Tooltip>
              {/* Refresh Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={() => {
                      // @TODO
                      setIsProcessing(true)
                    }}
                  >
                    <IconRefresh />
                    <span className="sr-only">Refresh file</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-background"
                    disabled={isProcessing}
                    onClick={() => {
                      // @TODO
                      setIsProcessing(true)
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
            Preview, update and remove files contained in this collection. Add
            a context template to each file to aid in inference.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="my-4 md:my-8" />
        {/* List of files */}
        {documents?.length > 0 ? (
          documents?.map(file => <BrainDocument key={file.id} file={file} />)
        ) : (
          <span className="text-center">No files uploaded yet.</span>
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