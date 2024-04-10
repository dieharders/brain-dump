import { useCallback } from 'react'
import { useGlobalContext } from '@/contexts'
import toast from 'react-hot-toast'
import { I_Collection, I_Document, I_GenericAPIResponse, T_GenericAPIRequest, T_GenericDataRes } from '@/lib/homebrew'

export type T_DocPayload = { [key: string]: any } | FormData

export const useMemoryActions = () => {
  const { services } = useGlobalContext()

  /**
   * Fetch the current collection and all its' source ids
   */
  const fetchCollection = useCallback(
    async (collection: I_Collection) => {
      try {
        if (!collection) throw new Error('No collection specified')
        if (!services) return null

        const body = { id: collection?.name }
        const res = await services?.memory.getCollection({ body })

        if (res?.success) return res?.data
        throw new Error(
          `Failed to fetch Collection [${collection?.name}]: ${res?.message}`,
        )
      } catch (err) {
        toast.error(`${err}`)
        return null
      }
    },
    [services],
  )

  const fetchDocumentChunks = useCallback(
    async (collectionName: string | null, doc: any) => {
      try {
        if (!collectionName || !doc)
          throw new Error('No collection or document specified.')
        if (!services) new Error('No services available.')

        const body = {
          collectionId: collectionName,
          document: doc,
        }

        const res = await services?.memory.getChunks({ body })

        if (!res?.success)
          throw new Error(`No document chunks found for collection:\n${collectionName}.`)

        const chunks = res?.data || []
        return chunks
      } catch (err) {
        toast.error(`Failed to fetch document chunks: ${err}`)
        return []
      }
    },
    [services],
  )

  // Fetch one or more documents from a collection
  const fetchDocumentsById = useCallback(
    async (collection: I_Collection, document_ids: string[]): Promise<I_Document[]> => {
      try {
        if (!collection) throw new Error('No collection or document ids specified')
        if (!services) return []

        const body = {
          collection_id: collection?.name,
          document_ids,
          include: ['documents', 'metadatas'],
        }
        const res = await services?.memory.getDocument({ body })
        if (!res?.success) throw new Error(`No documents found:\n${document_ids}`)

        const docs = res?.data || []
        return docs
      } catch (err) {
        toast.error(`Failed to fetch documents: ${err}`)
        return []
      }
    },
    [services],
  )

  /**
   * Fetch all documents for the specified collection
   */
  const fetchDocuments = useCallback(
    async (collection: I_Collection | null) => {
      if (!collection) return

      const collection_data = await fetchCollection(collection)
      if (!collection_data) return null

      const sources = collection_data?.collection?.metadata?.sources

      if (!sources || sources.length === 0) return null

      const res = await fetchDocumentsById(collection, sources)
      return res
    },
    [fetchDocumentsById, fetchCollection],
  )

  /**
   * Fetch all collections from index
   */
  const fetchCollections: () => Promise<Array<any>> = useCallback(async () => {
    try {
      if (!services) return

      const response = await services?.memory.getAllCollections()

      if (!response?.success) throw new Error('Failed to fetch collections')

      const data = response.data
      return data
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return []
    }
  }, [services])

  /**
 * Fetch all documents from collection id
 */
  const fetchDocumentsFromId = useCallback(async (collectionId: string | null) => {
    try {
      const allCollections = await fetchCollections()
      const currentCollection = allCollections.find((c: I_Collection) => c.id === collectionId)
      const documentsResponse = await fetchDocuments(currentCollection)

      if (documentsResponse?.length === 0) throw new Error('Failed to fetch documents.')
      return documentsResponse
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return
    }
  }, [fetchCollections, fetchDocuments])

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

  const updateDocument = async (collectionName: string | undefined, document: I_Document) => {
    try {
      if (!collectionName) throw new Error('No collection name provided.')

      const chunkSize = null // @TODO should come from a edit menu
      const chunkOverlap = null // @TODO should come from a edit menu
      const chunkStrategy = null // @TODO should come from a edit menu
      const payload = {
        body: {
          collectionName,
          documentId: document.metadata.id,
          documentName: document.metadata.name,
          metadata: document.metadata, // optional, if we want to upload new ones from a form
          urlPath: document.metadata.urlPath, // optional, load from disk for now, maybe provide a toggle for disk/url
          filePath: document.metadata.filePath,
          chunkSize: chunkSize,
          chunkOverlap: chunkOverlap,
          chunkStrategy: chunkStrategy,
        }
      }
      const res = await services?.memory.updateDocument(payload)
      if (!res?.success) toast.error(`Error ${res?.message}`)
      return null
    } catch (err) {
      toast.error(`${err}`)
      return null
    }
  }

  const deleteDocument = async (collectionName: string | undefined, document: I_Document) => {
    try {
      if (!collectionName) throw new Error('No collection name provided.')

      const res = await services?.memory.deleteDocuments({
        body: {
          collection_id: collectionName,
          document_ids: [document.metadata.id],
        }
      })
      // Fail
      if (!res?.success)
        throw new Error(`Failed to remove ${document.metadata.name}: ${res?.message}`)
      // Successful
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

  /**
   * Wipe entire vector database
   */
  const deleteAllCollections = async () => {
    try {
      const result = await services?.memory.wipe()
      if (!result?.success) throw new Error(result?.message)
      toast.success('All collections successfully removed ☠')
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

  /**
   * Delete all documents in this collection
   */
  const deleteAllDocuments = async () => {
    try {
      // @TODO Loop through all documents and remove them ...
      return true
      const result = await services?.memory.wipe()
      if (!result?.success) throw new Error(result?.message)
      toast.success('All documents successfully removed')
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

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

  const fileExploreAction = async (document: I_Document) => {
    await services?.memory.fileExplore({ queryParams: { filePath: document.metadata.filePath } })
    return
  }

  return {
    fileExploreAction,
    shareMemory,
    copyId,
    updateDocument,
    deleteDocument,
    deleteAllCollections,
    deleteAllDocuments,
    deleteCollection,
    addDocument,
    addCollection,
    fetchDocumentChunks,
    fetchDocumentsById,
    fetchDocuments,
    fetchDocumentsFromId,
    fetchCollections,
    fetchCollection,
  }
}
