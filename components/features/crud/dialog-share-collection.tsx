'use client'

import { useTransition } from 'react'
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
import { I_Collection } from '@/lib/homebrew'
import Link from 'next/link'

interface I_Props {
  collection: I_Collection | null
  action: (collection: I_Collection) => Promise<I_Collection>
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
}
export const DialogShareCollection = (props: I_Props) => {
  const { action, collection, dialogOpen, setDialogOpen } = props
  const [isSharePending, startShareTransition] = useTransition()
  const sharePath = collection?.metadata?.sharePath
  const createdAt = collection?.metadata?.createdAt
  const sources = collection?.metadata?.sources

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
          <div className="font-medium">{collection?.name}</div>
          <div className="text-muted-foreground">
            {formatDate(createdAt || '')} · {sources?.length} collections
          </div>
        </div>
        <DialogFooter className="items-center">
          {sharePath && (
            <Link
              href={sharePath}
              className={cn(badgeVariants({ variant: 'secondary' }), 'mr-auto')}
              target="_blank"
            >
              <IconUsers className="mr-2" />
              {sharePath}
            </Link>
          )}
          <Button
            disabled={isSharePending}
            onClick={() => {
              startShareTransition(async () => {
                if (!collection) return

                if (sharePath) {
                  await new Promise(resolve => setTimeout(resolve, 500))
                  copyShareLink({ data: collection, setDialogOpen })
                  return
                }

                const result = await action(collection)

                if (result && 'error' in result) {
                  toast.error(`${result.error}`)
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