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
  const [hasMounted, setHasMounted] = useState(false)
  const [collections, setCollections] = useState<Array<Brain>>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { getServices, apis } = useHomebrew()
  const removeBrain = async (id: string) => { return { message: '', success: true } as unknown as Response }
  const shareBrain = async (brain: Brain) => brain

  const refreshAction = useCallback(async () => {
    try {
      const services = await getServices()
      const req = await services?.memory.getAllCollections()
      const response = await req?.json()
      if (!response.success) throw Error('Unsuccessful')

      const data = response.data
      setCollections(data)
      return data
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge base: ${error}`)
      return
    }

  }, [getServices])

  // Fetch collections
  useEffect(() => {
    if (!hasMounted) {
      refreshAction()
      setHasMounted(true)
    }
  }, [hasMounted, refreshAction])

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
      {collections?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {collections.map(
            collection => (
              <SidebarItem key={collection?.id} brain={collection} apis={apis}>
                <SidebarActions collection={collection} remove={removeBrain} share={shareBrain} apis={apis} />
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
