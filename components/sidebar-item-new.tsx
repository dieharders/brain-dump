'use client'

import * as React from 'react'
import { ServerActionResult } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface I_Props {
  action?: () => ServerActionResult<void>
  actionTitle?: string
  actionDescription?: string
}

export function NewItem(props: I_Props) {
  const { action = () => Promise, actionTitle, actionDescription } = props
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" disabled={isPending}>
          {isPending && <IconSpinner className="mr-2" />}
          {actionTitle || '+ Add New'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>
            {actionDescription || 'This will add new data.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={event => {
              event.preventDefault()
              startTransition(async () => {
                const result = await action()

                if (result && 'error' in result) {
                  toast.error(result.error)
                  return
                }

                setOpen(false)
              })
            }}
          >
            <Link href="/">
              {isPending && <IconSpinner className="mr-2 animate-spin" />}
              Add
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
