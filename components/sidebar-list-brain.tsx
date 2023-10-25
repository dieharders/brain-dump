'use client'

import { useEffect, useState } from 'react'
import { getBrains, removeBrain, shareBrain } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions-brain'
// import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-brain'
import { DialogCreateBrain } from '@/components/dialog-create-brain'
import { Brain } from '@/lib/types'
import { Button } from '@/components/ui/button'

export interface SidebarBrainListProps {
  userId?: string
}

export const SidebarBrainList = ({ userId }: SidebarBrainListProps) => {
  const [brains, setBrains] = useState<Array<Brain>>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const action = async () => {
      const val = await getBrains(userId)
      setBrains(val)
    }
    userId && action()
  }, [userId])

  return (
    <div className="flex-1 overflow-auto">
      {/* Modal Form */}
      <DialogCreateBrain dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      {/* Modal activation button */}
      <div className="flex items-center justify-center">
        {/* <NewItem
          action={async () => setDialogOpen(true)}
          actionTitle="+ New Brain"
          actionDescription="This will add a new brain to your collection."
        ></NewItem> */}
        {/* @TODO Make this work with NewItem so it can show pending progress. Pass the form as prop. */}
        <Button onClick={() => setDialogOpen(true)} >+ New Brain</Button>
      </div>
      {/* List of data */}
      {brains?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {brains.map(
            brain =>
              brain && (
                <SidebarItem key={brain?.id} brain={brain}>
                  <SidebarActions brain={brain} remove={removeBrain} share={shareBrain} />
                </SidebarItem>
              ),
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No Brains Found</p>
        </div>
      )}
    </div>
  )
}
