'use client'

import { useCallback, useEffect, useState } from 'react'
import { CollectionCard } from '@/components/sidebar-item-brain'
import { DialogCreateCollection } from '@/components/features/crud/dialog-add-collection'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
import { ROUTE_KNOWLEDGE } from '@/app/constants'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { useMemoryActions } from '@/components/features/crud/actions'

export interface SidebarBrainListProps {
  userId?: string
}

export const SidebarBrainList = ({ userId }: SidebarBrainListProps) => {
  const router = useRouter()
  const { collections, setCollections, setSelectedDocumentId, setDocuments, setSelectedCollectionName } = useGlobalContext()
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false)
  const { fetchCollections, addCollection } = useMemoryActions()

  const updateListAction = useCallback(async () => {
    const data = await fetchCollections()
    data && setCollections(data)
  }, [fetchCollections, setCollections])

  // Fetch data when opened
  useEffect(() => {
    updateListAction()
  }, [updateListAction])

  return (
    <div className="mt-4 flex flex-col space-y-8 overflow-y-auto">
      {/* "Add New" and "Refresh" buttons */}
      <div className="flex items-center justify-center gap-4 px-4">
        <Button className="flex-1 text-center" onClick={() => setCreateCollectionDialogOpen(true)} >+ New Collection</Button>
        <RefreshButton action={updateListAction} />
      </div>
      {/* Collections */}
      <div className="scrollbar overflow-x-hidden pl-4 pr-2">
        {/* Pop-Up Menus */}
        <DialogCreateCollection action={addCollection} onSuccess={updateListAction} dialogOpen={createCollectionDialogOpen} setDialogOpen={setCreateCollectionDialogOpen} />
        {/* List of data */}
        {collections?.length > 0 ? (
          <div className="space-y-4">
            {collections?.map(
              collection => (
                <CollectionCard
                  key={collection?.id}
                  collection={collection}
                  onClick={() => {
                    setSelectedCollectionName(collection?.name)
                    // Reset data when changing collections
                    setDocuments([])
                    setSelectedDocumentId('')
                    // Update url to reflect selected id
                    router.push(`/${ROUTE_KNOWLEDGE}?collectionName=${collection.name}`, { shallow: true })
                  }}>
                </CollectionCard>
              )
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No Collections Found</p>
          </div>
        )}
      </div>
    </div>
  )
}
