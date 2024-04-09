import { useCallback } from 'react'
import { I_Collection, I_Document } from '@/lib/homebrew'
import toast from 'react-hot-toast'
import { useGlobalContext } from '@/contexts'

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
          throw new Error('No collection or document specified')
        if (!services) return []

        const body = {
          collectionId: collectionName,
          document: doc,
        }

        const res = await services?.memory.getChunks({ body })

        if (!res?.success)
          throw new Error(`No document chunks found for collection:\n${collectionName}`)

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
  const fetchCollections = useCallback(async () => {
    try {
      if (!services) return

      const response = await services?.memory.getAllCollections()

      if (!response?.success) throw new Error('Failed to fetch collections')

      const data = response.data
      return data
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return
    }
  }, [services])

  return {
    fetchDocumentChunks,
    fetchDocumentsById,
    fetchDocuments,
    fetchCollections,
    fetchCollection,
  }
}
