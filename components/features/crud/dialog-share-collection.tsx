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
// import { copyShareLink } from '@/components/sidebar-actions-chat'
import { cn, formatDate } from '@/lib/utils'
import { badgeVariants } from '@/components/ui/badge'
import { IconSpinner, IconUsers } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notifications } from '@/lib/notifications'

interface I_Props {
  name: string | undefined
  sharePath: string | undefined
  createdAt: string | undefined
  sources: Array<any>
  action: () => Promise<any>
  dialogOpen: boolean,
  setDialogOpen: (open: boolean) => void,
}
export const DialogShareCollection = (props: I_Props) => {
  const { action, dialogOpen, setDialogOpen, sharePath, createdAt, sources, name } = props
  const [isSharePending, startShareTransition] = useTransition()

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share a link with a friend</DialogTitle>
          <DialogDescription>
            Anyone with the URL will be able to view this shared collection.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 rounded-md border p-4 text-sm">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground">
            {formatDate(createdAt || '')} · {sources?.length} collections
          </div>
        </div>
        <DialogFooter className="items-center">
          {sharePath && (
            <Link
              href={sharePath}
              prefetch={false}
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
                notifications().notAvailable()
                return

                if (!sharePath) {
                  toast.error('No share path provided.')
                  return
                }

                // @TODO Implement a share feature for memories

                // if (sharePath) {
                //   await new Promise(resolve => setTimeout(resolve, 500))
                //   copyShareLink({ data: collection, setDialogOpen })
                //   return
                // }

                const result = await action()

                if (result && 'error' in result) {
                  toast.error(`${result.error}`)
                  return
                }

                // copyShareLink({ data: result, setDialogOpen })
                return
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
