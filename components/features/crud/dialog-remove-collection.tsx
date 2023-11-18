'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import toast from 'react-hot-toast'
import { IconSpinner } from '@/components/ui/icons'
import { Brain } from '@/lib/types'

interface I_Props {
  collection: Brain | null
  action: (id: string) => Promise<Response>
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
}

export const DialogRemoveCollection = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  const router = useRouter()
  const [isRemovePending, startRemoveTransition] = useTransition()

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                if (!collection) return

                const req = await action(collection.id)
                const res = await req.json()

                if (!res.success) {
                  toast.error(res.message)
                  return
                }

                setDialogOpen(false)
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
}