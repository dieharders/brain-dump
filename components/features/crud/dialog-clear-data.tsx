'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
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
import { IconSpinner } from '@/components/ui/icons'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ClearDataProps {
  Icon?: any
  action: () => Promise<boolean>
  actionTitle?: string
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"
  className?: string
}

export function ClearData(props: ClearDataProps) {
  const { action, actionTitle, Icon, variant, className } = props
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const style = "absolute right-0 top-0 m-auto flex h-[2.5rem] w-[2.5rem] flex-row items-center justify-center gap-2 rounded-none rounded-bl-md bg-transparent p-2 text-sm outline outline-8 outline-neutral-200 hover:bg-red-500 dark:bg-transparent dark:outline-neutral-900 dark:hover:bg-red-500"

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="w-full" asChild>
        <Button variant={variant || "ghost"} disabled={isPending} className={cn(style, className)}>
          {isPending && <IconSpinner className="mr-2" />}
          {Icon && <Icon />}
          {actionTitle || ''}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove data from storage. There is no undo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-primary hover:bg-red-800"
            disabled={isPending}
            onClick={event => {
              event.preventDefault()
              startTransition(async () => {
                await action()
                setOpen(false)
                // router.push('/')
                toast.success(`Item deleted`)
                return
              })
            }}
          >
            {isPending && <IconSpinner className="mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
