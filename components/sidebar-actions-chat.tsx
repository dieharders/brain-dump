'use client'

import * as React from 'react'
// import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
// import { cn, formatDate } from '@/lib/utils'
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
import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import { IconShare, IconSpinner, IconTrash, IconUsers } from '@/components/ui/icons'
import { IconSpinner, IconTrash } from '@/components/ui/icons'
// import Link from 'next/link'
// import { badgeVariants } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_GenericAPIResponse, I_Thread } from '@/lib/homebrew'

interface I_Props {
  chat: I_Thread
  removeChat: (id: string) => Promise<I_GenericAPIResponse<any> | undefined>
  // shareChat: (chat: I_Thread) => Promise<boolean>
}

// export const copyShareLink = (props: {
//   data: I_Thread
//   setDialogOpen: (b: boolean) => void
// }) => {
//   const { data, setDialogOpen } = props
//   if (!data.sharePath) {
//     return toast.error('Could not copy share link to clipboard')
//   }

//   const url = new URL(window.location.href)
//   url.pathname = data.sharePath
//   navigator.clipboard.writeText(url.toString())
//   setDialogOpen(false)
//   toast.success('Share link copied to clipboard', {
//     style: {
//       borderRadius: '10px',
//       background: '#333',
//       color: '#fff',
//       fontSize: '14px',
//     },
//     iconTheme: {
//       primary: 'white',
//       secondary: 'black',
//     },
//   })
// }

export function SidebarActions(props: I_Props) {
  const { chat, removeChat } = props
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  // const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  // const [isRemovePending, startRemoveTransition] = React.useTransition()
  const [isRemovePending, setIsRemovePending] = React.useState(false)
  // const [isSharePending, startShareTransition] = React.useTransition()
  // const router = useRouter()

  return (
    <>
      <div className="flex justify-between space-x-1">
        {/* Share Button */}
        {/* <Tooltip delayDuration={350}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background"
              onClick={() => setShareDialogOpen(true)}
            >
              <IconShare />
              <span className="sr-only">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share chat</TooltipContent>
        </Tooltip> */}
        {/* @TODO Add an edit button here for title */}
        {/* Delete Button */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-background"
              disabled={isRemovePending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <IconTrash />
              <span className="sr-only">Delete</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete chat</TooltipContent>
        </Tooltip>
      </div>
      {/* Share Menu */}
      {/* <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share link to chat</DialogTitle>
            <DialogDescription>
              Anyone with the URL will be able to view the shared chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 rounded-md border p-4 text-sm">
            <div className="font-medium">{chat.title}</div>
            <div className="text-muted-foreground">
              {formatDate(chat.createdAt)} · {chat.messages.length} messages
            </div>
          </div>
          <DialogFooter className="items-center">
            {chat.sharePath && (
              <Link
                href={chat.sharePath}
                prefetch={false}
                className={cn(badgeVariants({ variant: 'secondary' }), 'mr-auto')}
                target="_blank"
              >
                <IconUsers className="mr-2" />
                {chat.sharePath}
              </Link>
            )}
            <Button
              disabled={isSharePending}
              onClick={() => {
                startShareTransition(async () => {
                  if (chat.sharePath) {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    copyShareLink({ data: chat, setDialogOpen: setShareDialogOpen })
                    return
                  }

                  const result = await shareChat(chat)

                  if (!result) {
                    toast.error('Failed to share chat thread.')
                    return
                  }

                  copyShareLink({ data: chat, setDialogOpen: setShareDialogOpen })
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
      </Dialog> */}
      {/* Delete Menu */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your messages from your device
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
              onClick={event => {
                event.preventDefault()
                // startRemoveTransition(async () => {
                //   const result = await removeChat(chat.id)

                //   if (!result) {
                //     toast.error('Failed to remove chat thread.')
                //     return
                //   }

                //   setDeleteDialogOpen(false)
                //   router.refresh()
                //   router.push('/')
                //   toast.success('Chat deleted')
                // })
                const action = async () => {
                  setIsRemovePending(true)
                  const result = await removeChat(chat.id)
                  if (result?.success) {
                    toast.success('Chat deleted.')
                  } else {
                    toast.error(`Failed to remove chat thread.\n${result?.message}`)
                  }
                  setDeleteDialogOpen(false)
                  setIsRemovePending(false)
                  return
                }
                action()
              }}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
