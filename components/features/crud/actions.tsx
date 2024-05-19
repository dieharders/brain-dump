import { useCallback } from 'react'
import { useGlobalContext } from '@/contexts'
import toast from 'react-hot-toast'
import { I_Collection, I_DocumentChunk, I_GenericAPIResponse, I_Source, T_GenericAPIRequest, T_GenericDataRes } from '@/lib/homebrew'

export type T_DocPayload = { [key: string]: any } | FormData

export const useMemoryActions = () => {
  const { services } = useGlobalContext()

  /**
   * Fetch the specified collection and all its' source ids
   */
  const fetchCollection = useCallback(
    async (collectionName: string | null) => {
      try {
        if (!collectionName) throw new Error('No collection specified')
        if (!services) return null

        const body = { id: collectionName }

        const res = await services?.memory.getCollection({ body })

        if (res?.success) return res?.data
        throw new Error(
          `Failed to fetch Collection [${collectionName}]: ${res?.message}`,
        )
      } catch (err) {
        toast.error(`${err}`)
        return null
      }
    },
    [services],
  )

  const fetchDocumentChunks = useCallback(
    async ({ collectionId, documentId }: { collectionId: string | null, documentId: string }) => {
      try {
        if (!collectionId || !documentId)
          throw new Error('No id or document specified.')
        if (!services) new Error('No services available.')

        const body = {
          collectionId,
          documentId,
        }

        const res = await services?.memory.getChunks({ body })

        if (!res?.success)
          throw new Error(`No document chunks found for:\n${documentId}.`)

        const data: Array<I_DocumentChunk> = res?.data
        const orderedChunks = data?.sort((a, b) => a?.metadata?.order - b?.metadata?.order)
        return orderedChunks || []
      } catch (err) {
        toast.error(`Failed to fetch document chunks: ${err}`)
        return []
      }
    },
    [services],
  )

  /**
   * Fetch all collections from index
   */
  const fetchCollections = useCallback(async (): Promise<Array<I_Collection>> => {
    try {
      if (!services) return []
      const response = await services?.memory.getAllCollections()

      if (!response) throw new Error('Failed to fetch collections. No response.')
      if (typeof response?.success === 'boolean' && !response?.success) throw new Error('Failed to fetch collections from knowledge graph.')

      const data = response?.data
      return data
    } catch (error) {
      toast.error(`${error}`)
      return []
    }
  }, [services])

  const addDocument: T_GenericAPIRequest<any, T_GenericDataRes> = useCallback(async (args) => {
    return services?.memory.addDocument(args) || null
  }, [services?.memory])

  const addCollection: T_GenericAPIRequest<any, T_GenericDataRes> = useCallback(async (args) => {
    const promise = new Promise((resolve, reject) => {
      const action = async () => {
        const result = await services?.memory.addCollection(args)
        // Error
        if (!result || !result?.success) reject(result?.message)
        // Success
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
  }, [services?.memory])

  const deleteCollection = useCallback(async (collectionName: string) => {
    const res = await services?.memory.deleteCollection({ queryParams: { collection_id: collectionName } }) || null
    return res
  }, [services?.memory])

  const updateDocument: T_GenericAPIRequest<any, T_GenericDataRes> = useCallback(async (payload) => {
    return services?.memory.updateDocument(payload) || null
  }, [services?.memory])

  const deleteSource = useCallback(async (collectionName: string | undefined, document: I_Source) => {
    try {
      if (!collectionName) throw new Error('No collection name provided.')

      const res = await services?.memory.deleteDocuments({
        body: {
          collection_id: collectionName,
          document_ids: [document.id],
        }
      })
      // Fail
      if (!res?.success)
        throw new Error(`Failed to remove ${document.name}: ${res?.message}`)
      // Successful
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }, [services?.memory])

  /**
   * Wipe entire vector database
   */
  const deleteAllCollections = useCallback(async () => {
    try {
      const result = await services?.memory.wipe()
      if (!result?.success) throw new Error(result?.message)
      toast.success('All collections successfully removed ☠')
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }, [services?.memory])

  const shareMemory = async () => {
    const msg = 'Please consider becoming a Premium sponsor to use social features, thank you!'
    toast(msg, { icon: '💰' })
    return false
  }

  const copyId = (id: string | null) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    toast.success('Copied item id to clipboard!')
  }

  const fileExploreAction = useCallback(async (document: I_Source) => {
    await services?.memory.fileExplore({ queryParams: { filePath: document.filePath } })
    return
  }, [services?.memory])

  return {
    fileExploreAction,
    shareMemory,
    copyId,
    updateDocument,
    deleteSource,
    deleteAllCollections,
    deleteCollection,
    addDocument,
    addCollection,
    fetchDocumentChunks,
    fetchCollections,
    fetchCollection,
  }
}
