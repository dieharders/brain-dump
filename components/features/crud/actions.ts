import { useCallback } from 'react'
import { I_Collection, I_Document, I_ServiceApis } from '@/lib/homebrew'
import toast from 'react-hot-toast'

export const useMemoryActions = (services: I_ServiceApis | null) => {
  // Fetch the current collection and all its' source ids
  const fetchCollection = useCallback(
    async (collection: I_Collection) => {
      try {
        if (!collection) throw new Error('No collection specified')

        const body = { id: collection?.name }
        const res = await services?.memory.getCollection({ body })

        if (res?.success) return res?.data
        throw new Error(
          `Failed to fetch Collection [${collection?.name}]: ${res?.message}`,
        )
      } catch (err) {
        toast.error(`${err}`)
        return false
      }
    },
    [services?.memory],
  )

  // Fetch all documents for collection
  const fetchAllDocuments = useCallback(
    async (collection: I_Collection, document_ids: string[]): Promise<I_Document[]> => {
      try {
        if (!collection) throw new Error('No collection or document ids specified')

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
    [services?.memory],
  )

  // Fetch all documents for the specified collection
  const fetchAll = useCallback(
    async (collection: I_Collection | null) => {
      if (!collection) return

      const collection_data = await fetchCollection(collection)
      if (!collection_data) return null

      const sources = collection_data?.collection?.metadata?.sources

      if (!sources || sources.length === 0) return null

      const res = await fetchAllDocuments(collection, sources)
      return res
    },
    [fetchAllDocuments, fetchCollection],
  )

  const fetchCollections = useCallback(async () => {
    try {
      const response = await services?.memory.getAllCollections()

      if (!response?.success) throw new Error('Failed to fetch collections')

      const data = response.data
      return data
    } catch (error) {
      toast.error(`Failed to fetch collections from knowledge graph: ${error}`)
      return
    }
  }, [services?.memory])

  return { fetchAll, fetchCollections, fetchCollection, fetchAllDocuments }
}
