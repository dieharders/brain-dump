'use client'

import * as React from 'react'
import { Brain, ServerActionResult, T_FileMedia } from '@/lib/types'
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

interface I_Props {
  brain: Brain
  remove: (args: { id: string }) => ServerActionResult<void>
  share: (brain: Brain) => ServerActionResult<Brain>
}

export function SidebarActions(props: I_Props) {
  const router = useRouter()
  const { brain, remove, share } = props
  const { documents } = brain
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isSharePending, startShareTransition] = React.useTransition()
  const [exploreDialogOpen, setExploreDialogOpen] = React.useState(false)
  const [isUploadPending, setIsUploadPending] = React.useState(false)

  const BrainDocument = ({ file }: { file: T_FileMedia }) => {
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
            {file.title}
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
                const result = await remove({
                  id: brain.id,
                })

                if (result && 'error' in result) {
                  toast.error(result.error)
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
          <DialogTitle>Share link to your brain</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view this shared brain.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 rounded-md border p-4 text-sm">
          <div className="font-medium">{brain.title}</div>
          <div className="text-muted-foreground">
            {formatDate(brain.createdAt)} · {brain.documents.length} brains
          </div>
        </div>
        <DialogFooter className="items-center">
          {brain.sharePath && (
            <Link
              href={brain.sharePath}
              className={cn(badgeVariants({ variant: 'secondary' }), 'mr-auto')}
              target="_blank"
            >
              <IconUsers className="mr-2" />
              {brain.sharePath}
            </Link>
          )}
          <Button
            disabled={isSharePending}
            onClick={() => {
              startShareTransition(async () => {
                if (brain.sharePath) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                  copyShareLink({ data: brain, setDialogOpen: setShareDialogOpen })
                  return
                }

                const result = await share(brain)

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
  const exploreMenu = (
    <AlertDialog open={exploreDialogOpen} onOpenChange={setExploreDialogOpen}>
      <AlertDialogContent>
        {/* Title/Descr */}
        <AlertDialogHeader>
          <AlertDialogTitle>Explore files in this brain</AlertDialogTitle>
          <AlertDialogDescription>
            Upload, remove, and update files contained in this brain. Also optionally add
            a context template to each file to aid in inference.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="my-4 md:my-8" />
        {/* List of files */}
        {documents.length > 0 ? (
          documents.map(file => <BrainDocument key={file.id} file={file} />)
        ) : (
          <span className="text-center">No files uploaded yet.</span>
        )}
        {/* Upload Area */}
        <Button
          className="align-center flex justify-center"
          onClick={() => {
            // @TODO Pre-Process media and send to backend
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
            onClick={() => setExploreDialogOpen(true)}
          >
            <IconEdit />
            <span className="sr-only">Edit brain</span>
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
            <span className="sr-only">Share brain</span>
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
            <span className="sr-only">Delete brain</span>
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
