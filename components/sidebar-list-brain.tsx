'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { I_Collection, I_GenericAPIResponse, I_ServiceApis, T_GenericAPIRequest, T_GenericDataRes, useHomebrew } from '@/lib/homebrew'
// import { NewItem } from '@/components/sidebar-item-new'
import { CollectionCard } from '@/components/sidebar-item-brain'
import { CollectionActions } from '@/components/sidebar-actions-brain'
import { DialogCreateCollection } from '@/components/features/crud/dialog-create-collection'
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
  const APIConfigOptions = useRef({})
  const { getServices, getAPIConfigOptions } = useHomebrew()
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [collections, setCollections] = useState<Array<I_Collection>>([])
  const [selectedCollection, setSelectedCollection] = useState<I_Collection | null>(null)
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false)
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [exploreDialogOpen, setExploreDialogOpen] = useState(false)

  const updateListAction = useCallback(async (apis: I_ServiceApis | null) => {
    try {
      const response = await apis?.memory.getAllCollections()

      if (!response?.success) throw new Error('Failed to refresh documents')

      const data = response.data
      data && setCollections(data)
      return data
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return
    }
  }, [])

  const addCollection: T_GenericAPIRequest<T_GenericDataRes> = useCallback(async (args) => {
    const promise = new Promise((resolve, reject) => {
      const action = async () => {
        const result = await services?.memory.addCollection(args)
        // Error
        if (!result || !result?.success) reject(result?.message)
        // Success
        await updateListAction(services)
        resolve(result)
      }
      action()
    })

    toast.promise(
      promise,
      {
        loading: 'Adding collection...',
        success: <b>Collection saved!</b>,
        error: (err: Error) => <p><b>Could not save collection 😐</b>{"\n"}{`${err?.message}`}</p>,
      }
    )

    return promise as unknown as I_GenericAPIResponse<T_GenericDataRes>
  }, [updateListAction, services])

  const addDocument: T_GenericAPIRequest<T_GenericDataRes> = useCallback(async (args) => {
    return services?.memory.addDocument(args) || null
  }, [services?.memory])

  const removeCollection = useCallback(async () => {
    const id = selectedCollection?.name || ''
    const res = await services?.memory.deleteCollection({ queryParams: { collection_id: id } }) || null
    updateListAction(services)
    return res
  }, [updateListAction, selectedCollection?.name, services])

  const shareCollection = async (collection: I_Collection) => {
    const msg = 'Please consider becoming a Premium sponsor to use social features, thank you!'
    toast(msg, { icon: '💰' })
    return collection
  }

  const copyCollectionId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('Copied collection id to clipboard')
  }

  // Fetch collections
  useEffect(() => {
    const action = async () => {
      const res = await getServices()

      if (res) {
        setServices(res)
        updateListAction(res)
        setHasMounted(true)
      }
    }
    if (!hasMounted) action()
  }, [getServices, hasMounted, updateListAction])

  // Fetch api options
  useEffect(() => {
    const action = async () => {
      const options = await getAPIConfigOptions()
      if (options) APIConfigOptions.current = options
    }
    action()
  }, [])

  return (
    <div className="mt-4 flex flex-col space-y-8 overflow-y-auto">
      {/* "Add New" and "Refresh" buttons */}
      <div className="flex items-center justify-center gap-4 px-4">
        {/* <NewItem
          action={async () => setDialogOpen(true)}
          actionTitle="+ New Brain"
          actionDescription="This will add a new brain to your collection."
        ></NewItem> */}
        {/* @TODO Make this work with NewItem so it can show pending progress. Pass the form as prop. */}
        <Button className="flex-1 text-center" onClick={() => setCreateCollectionDialogOpen(true)} >+ New Collection</Button>
        <RefreshButton action={() => updateListAction(services)} />
      </div>
      {/* Collections */}
      <div className="scrollbar overflow-x-hidden pl-4 pr-2">
        {/* Pop-Up Menus */}
        <DialogCreateCollection action={addCollection} dialogOpen={createCollectionDialogOpen} setDialogOpen={setCreateCollectionDialogOpen} />
        <DialogAddDocument action={addDocument} dialogOpen={addDocumentDialogOpen} setDialogOpen={setAddDocumentDialogOpen} collection={selectedCollection} options={APIConfigOptions.current} />
        <DialogShareCollection action={shareCollection} dialogOpen={shareDialogOpen} setDialogOpen={setShareDialogOpen} collection={selectedCollection} />
        <DialogRemoveCollection action={removeCollection} dialogOpen={deleteDialogOpen} setDialogOpen={setDeleteDialogOpen} collection={selectedCollection} />
        <DialogExploreDocuments dialogOpen={exploreDialogOpen} setDialogOpen={setExploreDialogOpen} collection={selectedCollection} services={services} />
        {/* List of data */}
        {collections?.length ? (
          <div className="space-y-4">
            {collections?.map(
              collection => (
                <CollectionCard key={collection?.id} collection={collection} onClick={() => {
                  setSelectedCollection(collection)
                  setExploreDialogOpen(true)
                }}>
                  <CollectionActions
                    setAddDocumentDialogOpen={setAddDocumentDialogOpen}
                    setExploreDialogOpen={setExploreDialogOpen}
                    setShareDialogOpen={setShareDialogOpen}
                    setDeleteDialogOpen={setDeleteDialogOpen}
                    setSelectedCollection={() => setSelectedCollection(collection)}
                    copyCollectionId={() => copyCollectionId(collection?.name)}
                  />
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
