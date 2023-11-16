'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useHomebrew } from '@/lib/homebrew'
// import { getBrains, removeBrain, shareBrain } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions-brain'
// import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-brain'
import { DialogCreateBrain } from '@/components/dialog-create-brain'
import { Brain } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'

export interface SidebarBrainListProps {
  userId?: string
}

export const SidebarBrainList = ({ userId }: SidebarBrainListProps) => {
  const [brains, setBrains] = useState<Array<Brain>>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { getServices, apis } = useHomebrew() // @TODO Get "apis" passed to us from global scope
  const removeBrain = async (id: string) => { return { message: '', success: true } as unknown as Response }
  const shareBrain = async (brain: Brain) => brain

  const refreshAction = useCallback(async () => {
    try {
      const apis = await getServices()
      const req = await apis?.memory.getAllCollections()
      const response = await req?.json()
      if (!response.success) throw Error('Unsuccessful')

      const collections = response.data
      setBrains(collections)
      return collections
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge base: ${error}`)
      return
    }

  }, [getServices])

  useEffect(() => {
    if (!isMounted) {
      refreshAction()
      setIsMounted(true)
    }
  }, [isMounted, refreshAction])

  return (
    <div className="flex-1 overflow-auto">
      {/* Modal Form */}
      <DialogCreateBrain dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      {/* Modal activation button */}
      <div className="flex items-center justify-center gap-2 px-4">
        {/* <NewItem
          action={async () => setDialogOpen(true)}
          actionTitle="+ New Brain"
          actionDescription="This will add a new brain to your collection."
        ></NewItem> */}
        {/* @TODO Make this work with NewItem so it can show pending progress. Pass the form as prop. */}
        <Button className="flex-1 text-center" onClick={() => setDialogOpen(true)} >+ New Collection</Button>
        <RefreshButton action={refreshAction} />
      </div>
      {/* List of data */}
      {brains?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {brains.map(
            brain => (
              <SidebarItem key={brain?.id} brain={brain}>
                <SidebarActions brain={brain} remove={removeBrain} share={shareBrain} />
              </SidebarItem>
            )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No Collections Found</p>
        </div>
      )}
    </div>
  )
}
