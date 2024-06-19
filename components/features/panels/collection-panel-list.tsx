'use client'

import { useState } from 'react'
import { CollectionCard } from '@/components/features/panels/collection-card'
import { DialogCreateCollection } from '@/components/features/crud/dialog-add-collection'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
import { ROUTE_KNOWLEDGE } from '@/app/constants'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { useMemoryActions } from '@/components/features/crud/actions'

export interface CollectionListProps {
  userId?: string
  fetchAction?: () => void
}

export const CollectionList = ({ userId, fetchAction }: CollectionListProps) => {
  const router = useRouter()
  const { collections, setSelectedDocumentId, setDocuments, selectedCollectionName, setSelectedCollectionName } = useGlobalContext()
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false)
  const { addCollection } = useMemoryActions()

  return (
    <div className="my-4 flex w-full flex-col space-y-8 overflow-y-auto">
      {/* "Add New" and "Refresh" buttons */}
      <div className="flex items-center justify-center gap-4 overflow-hidden whitespace-nowrap px-4 py-2">
        <Button className="flex-1 truncate text-center" onClick={() => setCreateCollectionDialogOpen(true)} >+ New Collection</Button>
        <RefreshButton action={fetchAction} />
      </div>
      {/* Collections */}
      <div className="scrollbar overflow-x-hidden pl-4 pr-2">
        {/* Pop-Up Menus */}
        <DialogCreateCollection action={addCollection} onSuccess={fetchAction} dialogOpen={createCollectionDialogOpen} setDialogOpen={setCreateCollectionDialogOpen} />
        {/* List of data */}
        {collections?.length > 0 ? (
          <div className="space-y-4">
            {collections?.map(
              collection => (
                <CollectionCard
                  key={collection?.id}
                  collection={collection}
                  isActive={selectedCollectionName === collection?.name}
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
