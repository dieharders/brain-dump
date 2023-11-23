'use client'

import { useTransition } from 'react'
// import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
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
import { IconSpinner } from '@/components/ui/icons'
import { I_Collection, T_GenericAPIRequest, T_GenericDataRes } from '@/lib/homebrew'

interface I_Props {
  collection: I_Collection | null
  action: T_GenericAPIRequest<T_GenericDataRes>
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void
}

export const DialogRemoveCollection = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  // const router = useRouter()
  const [isRemovePending, startRemoveTransition] = useTransition()

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this collection from your device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemovePending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isRemovePending}
            onClick={event => {
              event.preventDefault()
              startRemoveTransition(async () => {
                try {
                  if (!collection) throw new Error('No collection exists')
                  const res = await action()
                  setDialogOpen(false)
                  // router.refresh()
                  // router.push('/')
                  if (!res?.success) throw new Error(res?.message)
                  toast.success(`Collection [${collection?.name}] deleted`)
                  return
                } catch (err) {
                  toast.error(`${err}`)
                  return
                }
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
}