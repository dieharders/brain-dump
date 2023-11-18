'use client'

import { useTransition } from 'react'
import { Brain } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { copyShareLink } from '@/components/sidebar-actions-chat'
import { cn, formatDate } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'
import { IconSpinner, IconUsers } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface I_Props {
  collection: Brain | null
  action: (collection: Brain) => Promise<Brain>
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
}
export const DialogShareCollection = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  const [isSharePending, startShareTransition] = useTransition()

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link to your collection</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view this shared collection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 rounded-md border p-4 text-sm">
          <div className="font-medium">{collection?.title}</div>
          <div className="text-muted-foreground">
            {formatDate(collection?.createdAt || '')} · {collection?.documents?.length} brains
          </div>
        </div>
        <DialogFooter className="items-center">
          {collection?.sharePath && (
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
                if (!collection) return

                if (collection.sharePath) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                  copyShareLink({ data: collection, setDialogOpen })
                  return
                }

                const result = await action(collection)

                if (result && 'error' in result) {
                  toast.error(result.error)
                  return
                }

                copyShareLink({ data: result, setDialogOpen })
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
}