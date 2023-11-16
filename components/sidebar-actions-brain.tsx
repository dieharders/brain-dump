'use client'

import * as React from 'react'
import { Brain, T_Chunk } from '@/lib/types'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconEdit,
  IconOpenAI,
  IconRefresh,
  IconShare,
  IconTrash,
} from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconSpinner, IconUsers } from '@/components/ui/icons'
import { cn, formatDate } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { copyShareLink } from '@/components/sidebar-actions-chat'
import { IconDocument } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { I_ServiceApis } from '@/lib/homebrew'

interface I_Props {
  collection: Brain
  remove: (id: string) => Promise<Response>
  share: (collection: Brain) => Promise<Brain>
  apis: I_ServiceApis | null
}

export function SidebarActions(props: I_Props) {
  const router = useRouter()
  const { collection, remove, share, apis } = props
  const [documentIds, setDocumentIds] = React.useState<string[]>([])
  const [documents, setDocuments] = React.useState<T_Chunk[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isSharePending, startShareTransition] = React.useTransition()
  const [exploreDialogOpen, setExploreDialogOpen] = React.useState(false)
  const [isUploadPending, setIsUploadPending] = React.useState(false)

  // Fetch the current collection and all its' document ids
  const fetchCollection = async () => {
    try {
      const req = await apis?.memory.getCollection({ id: collection.name })
      const res = await req?.json()
      const document_ids = res?.data.documents.ids
      if (res?.success && document_ids.length) {
        setDocumentIds(document_ids)
        return document_ids
      }
      throw Error(`Failed to fetch Collection ${collection.name}`)
    } catch (err) {
      return false
    }
  }

  // Fetch all documents for collection (actually returning the chunks of the document)
  const fetchAllDocuments = async () => {
    try {
      const req = await apis?.memory.getDocument({ collection_id: collection.name, document_ids: documentIds })
      const res = await req?.json()
      const len = res?.data?.documents.length || 0
      const parsedDocs = []

      if (!res?.success || len === 0) throw Error(`Failed to fetch Documents:\n${documentIds}`)

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
      return false
    }
  }

  const BrainDocument = ({ file }: { file: T_Chunk }) => {
    const [isActive, setIsActive] = React.useState(false)

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
                    disabled={isUploadPending}
                    onClick={() => {
                      // @TODO
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
                    disabled={isUploadPending}
                    onClick={() => {
                      // @TODO
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
                    disabled={isUploadPending}
                    onClick={() => {
                      // @TODO
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

  const deleteMenu = (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemovePending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isRemovePending}
            onClick={event => {
              event.preventDefault()
              startRemoveTransition(async () => {
                const result = await remove(collection.id)
                const success = await result.json()

                if (!success.ok) {
                  // toast.error(result.message)
                  return
                }

                setDeleteDialogOpen(false)
                router.refresh()
                router.push('/')
                toast.success('Brain deleted')
              })
            }}
          >
            {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  const shareMenu = (
    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to your collection</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view this shared collection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 rounded-md border p-4 text-sm">
          <div className="font-medium">{collection.title}</div>
          <div className="text-muted-foreground">
            {formatDate(collection?.createdAt)} · {collection?.documents?.length} brains
          </div>
        </div>
        <DialogFooter className="items-center">
          {collection.sharePath && (
            <Link
              href={collection.sharePath}
              className={cn(badgeVariants({ variant: 'secondary' }), 'mr-auto')}
              target="_blank"
            >
              <IconUsers className="mr-2" />
              {collection.sharePath}
            </Link>
          )}
          <Button
            disabled={isSharePending}
            onClick={() => {
              startShareTransition(async () => {
                if (collection.sharePath) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                  copyShareLink({ data: collection, setDialogOpen: setShareDialogOpen })
                  return
                }

                const result = await share(collection)

                if (result && 'error' in result) {
                  toast.error(result.error)
                  return
                }

                copyShareLink({ data: result, setDialogOpen: setShareDialogOpen })
              })
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  // Show a list of documents in collection
  const exploreMenu = (
    <AlertDialog open={exploreDialogOpen} onOpenChange={setExploreDialogOpen}>
      <AlertDialogContent>
        {/* Title/Descr */}
        <AlertDialogHeader>
          <AlertDialogTitle>Explore files in this collection</AlertDialogTitle>
          <AlertDialogDescription>
            Upload, remove, and update files contained in this collection. Also optionally add
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
        {/* Upload Area */}
        <Button
          className="align-center flex justify-center"
          onClick={() => {
            // @TODO Pre-Process media and send to backend.
            // Copy the code over from the embedding form.
            // ...
          }}
        >
          Upload media files (5mb each)
        </Button>
        <Separator className="my-4 md:my-8" />
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              // Cancel upload process
              // ...
              setIsUploadPending(false)
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isUploadPending}
            onClick={event => {
              event.preventDefault()
              setExploreDialogOpen(false)
            }}
          >
            {isUploadPending && <IconSpinner className="mr-2 animate-spin" />}
            Finish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <div className="flex justify-between space-x-1">
      {/* Edit Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={async () => {
              setExploreDialogOpen(true)
              const success = await fetchCollection()
              if (!success) return
              await fetchAllDocuments()
            }}
          >
            <IconEdit />
            <span className="sr-only">Edit collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      {/* Share Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            onClick={() => setShareDialogOpen(true)}
          >
            <IconShare />
            <span className="sr-only">Share collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
      {/* Delete Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            disabled={isRemovePending}
            onClick={() => {
              setDeleteDialogOpen(true)
            }}
          >
            <IconTrash />
            <span className="sr-only">Delete collection</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
      {/* Pop-Up Menus */}
      {exploreMenu}
      {shareMenu}
      {deleteMenu}
    </div>
  )
}
