'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { I_GenericAPIRequestParams, I_GenericAPIResponse, useHomebrew } from '@/lib/homebrew'
// import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-brain'
import { SidebarActions } from '@/components/sidebar-actions-brain'
import { DialogCreateCollection } from '@/components/features/crud/dialog-create-collection'
import { Brain } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { RefreshButton } from '@/components/features/refresh/refresh-button'
import { DialogAddDocument } from '@/components/features/crud/dialog-add-document'
import { DialogShareCollection } from '@/components/features/crud/dialog-share-collection'
import { DialogRemoveCollection } from '@/components/features/crud/dialog-remove-collection'
import { DialogExploreDocuments } from '@/components/features/crud/dialog-explore-documents'

export interface SidebarBrainListProps {
  userId?: string
}

export const SidebarBrainList = ({ userId }: SidebarBrainListProps) => {
  const { getServices, apis } = useHomebrew()
  const [hasMounted, setHasMounted] = useState(false)
  const [collections, setCollections] = useState<Array<Brain>>([])
  const [selectedCollection, setSelectedCollection] = useState<Brain | null>(null)
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false)
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exploreDialogOpen, setExploreDialogOpen] = useState(false)

  const addDocument = async (payload: I_GenericAPIRequestParams) => {
    const res = await apis?.memory.create(payload) as I_GenericAPIResponse
    return res || {}
  }
  const removeCollection = async (id: string) => { return { message: '', success: true } as I_GenericAPIResponse }
  const shareCollection = async (brain: Brain) => brain

  const refreshAction = useCallback(async () => {
    try {
      const services = await getServices()
      const response = await services?.memory.getAllCollections()
      if (!response?.success) throw new Error('Failed to refresh documents')

      const data = response.data
      data && setCollections(data)
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
      {/* Pop-Up Menus */}
      <DialogCreateCollection dialogOpen={createCollectionDialogOpen} setDialogOpen={setCreateCollectionDialogOpen} apis={apis} />
      <DialogAddDocument action={addDocument} dialogOpen={addDocumentDialogOpen} setDialogOpen={setAddDocumentDialogOpen} collection={selectedCollection} />
      <DialogShareCollection action={shareCollection} dialogOpen={shareDialogOpen} setDialogOpen={setShareDialogOpen} collection={selectedCollection} />
      <DialogRemoveCollection action={removeCollection} dialogOpen={deleteDialogOpen} setDialogOpen={setDeleteDialogOpen} collection={selectedCollection} />
      <DialogExploreDocuments dialogOpen={exploreDialogOpen} setDialogOpen={setExploreDialogOpen} collection={selectedCollection} apis={apis} />
      {/* "Add New" and "Refresh" buttons */}
      <div className="flex items-center justify-center gap-2 px-4">
        {/* <NewItem
          action={async () => setDialogOpen(true)}
          actionTitle="+ New Brain"
          actionDescription="This will add a new brain to your collection."
        ></NewItem> */}
        {/* @TODO Make this work with NewItem so it can show pending progress. Pass the form as prop. */}
        <Button className="flex-1 text-center" onClick={() => setCreateCollectionDialogOpen(true)} >+ New Collection</Button>
        <RefreshButton action={refreshAction} />
      </div>
      {/* List of data */}
      {collections?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {collections.map(
            collection => (
              <SidebarItem key={collection?.id} brain={collection} apis={apis}>
                <SidebarActions
                  setAddDocumentDialogOpen={setAddDocumentDialogOpen}
                  setExploreDialogOpen={setExploreDialogOpen}
                  setShareDialogOpen={setShareDialogOpen}
                  setDeleteDialogOpen={setDeleteDialogOpen}
                  setSelectedCollection={() => setSelectedCollection(collection)}
                />
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
