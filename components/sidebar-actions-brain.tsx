'use client'

import * as React from 'react'
import { Brain, ServerActionResult } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { IconEdit, IconShare, IconTrash } from '@/components/ui/icons'
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

interface I_Props {
  brain: Brain
  remove: (args: { id: string }) => ServerActionResult<void>
  share: (brain: Brain) => ServerActionResult<Brain>
}

export function SidebarActions(props: I_Props) {
  const router = useRouter()
  const { brain, remove, share } = props
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [isSharePending, startShareTransition] = React.useTransition()
  const [exploreDialogOpen, setExploreDialogOpen] = React.useState(false)
  const [isUploadPending, setIsUploadPending] = React.useState(false)

  const deleteMenu = (
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your chat message and remove your data from our
            servers.
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
        {/* List of files */}
        {/* ... */}
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
              console.log('@@ clicked delete')
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
