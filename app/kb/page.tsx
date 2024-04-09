'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRenderText } from '@/components/ui/useRenderText'
import { Select } from '@/components/ui/select'
import ToggleGroup from '@/components/ui/toggle-group'
import toast from 'react-hot-toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useHomebrew } from '@/lib/homebrew'

export default function KnowledgeBasePage() {
  const { services, setServices, documents, setDocuments, selectedDocumentId, collections, setCollections, selectedCollectionId } = useGlobalContext()
  const search = useSearchParams()
  const id = search.get('collectionId') || selectedCollectionId
  const router = useRouter()
  const { getServices } = useHomebrew()
  const { fetchCollections } = useMemoryActions()
  const { RandomUnderlinedText } = useRenderText()
  const collection = collections.find((c: any) => c.id === id)
  const document = documents.find(d => d.metadata.id === selectedDocumentId)
  const documentName = document?.metadata?.name
  const documentId = document?.metadata?.id
  const documentFileName = document?.metadata?.fileName
  const documentTags = document?.metadata?.tags
  const documentDate = document?.metadata?.createdAt
  const documentType = document?.metadata?.type
  const documentPath = document?.metadata?.filePath
  const documentUrlPath = document?.metadata.urlPath
  const chunks = document?.metadata?.chunk_ids
  const documentChunkIds = chunks ? JSON.parse(chunks) : []
  const documentText = document?.documents
  const description = document?.metadata?.description
  const collectionName = collection?.name
  const collectionTags = collection?.metadata?.tags || ''
  const chunkItems = documentChunkIds?.map?.((ch: string, index: number) => ({ name: `Chunk: ${index + 1}`, value: ch }))
  // State
  const [mounted, setMounted] = useState(false)
  const [toggleTextMode, setToggleTextMode] = useState<string>('document')
  const [selectedChunk, setSelectedChunk] = useState<string | undefined>(undefined)
  // Styles
  const toggleStyle = cn("self-center rounded-sm p-4 text-lg")
  const headingStyle = cn("text-2xl font-bold")
  const subHeadingStyle = cn("text-lg font-semibold")
  const descriptionStyle = cn("text-md text-muted-foreground")
  const tagStyle = cn("flex flex-row flex-wrap items-center justify-start gap-2")

  const copyId = (id: string | undefined) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    toast.success('Copied collection id to clipboard')
  }

  const collectionNotFound = (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8 p-8">
      <p className="text-8xl">🥺</p>
      <span className="text-center text-2xl font-bold">No collection found, so sad.</span>
      <Button
        variant="outline"
        className="text-md"
        onClick={() => router.replace('home')}
      >
        Back to Main Menu</Button>
    </div>
  )

  const documentNotFound = (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8 p-8">
      <p className="text-8xl">🤔</p>
      <span className="text-center text-2xl font-bold">No document found, huh...</span>
      {/* @TODO Make this a button that can show the user where this menu is visually */}
      <p className={descriptionStyle}>
        {`Try selecting a document from the "Documents" button on the header.`}
      </p>
    </div>
  )

  const documentPage = (
    document ?
      <div className="flex w-full flex-1 flex-col items-center justify-start gap-8">
        <div className={cn("w-full self-center text-center", headingStyle)}>Document</div>
        {/* Actions */}
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2 overflow-hidden">
          <Button variant="outline" className="w-fit p-5 text-lg">Open</Button>
          <Button variant="outline" className="w-fit p-5 text-lg">Edit</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => copyId(documentId)}>Copy Id</Button>
          <Button variant="outline" className="w-fit p-5 text-lg">Share</Button>
          <Button variant="destructive" className="w-fit p-5 text-lg">Delete</Button>
        </div>
        <div className="flex h-full w-full flex-col items-stretch justify-center gap-8 overflow-hidden md:flex-row">
          {/* Document info */}
          <div className="flex w-fit flex-1 flex-col items-start justify-start gap-3">
            <h1 className={subHeadingStyle}>{documentName || 'No title'}</h1>
            <p className={descriptionStyle}>{description || 'No description'}</p>
            <div className={subHeadingStyle}>Info</div>
            <div className={tagStyle}>🔖: {<RandomUnderlinedText className="text-muted-foreground" text={documentTags || ''} /> || 'Add some tags'}</div>
            <p className={descriptionStyle}>📅: {documentDate}</p>
            <p className={descriptionStyle}>📄: {documentFileName}</p>
            <p className={descriptionStyle}>📁: {documentPath}</p>
            {documentUrlPath && <p className={descriptionStyle}>🌐: {documentUrlPath}</p>}
            {documentType && <p className={descriptionStyle}>📎: {documentType}</p>}
          </div>
          {/* Separator */}
          <div className="flex flex-col items-center justify-center border-0 border-t-2 md:border-l-2"></div>
          {/* Document Text/Chunks */}
          <div className="flex flex-1 flex-col items-center justify-start gap-4 overflow-hidden px-1">
            {/* Toggle Group */}
            <ToggleGroup
              label="Text Mode"
              value={toggleTextMode}
              onChange={setToggleTextMode}
            >
              {/* Document Text */}
              <div id="document">
                <Tooltip delayDuration={250}>
                  <TooltipTrigger asChild>
                    <div className={toggleStyle}>📄</div>
                  </TooltipTrigger>
                  <TooltipContent>Document</TooltipContent>
                </Tooltip>
              </div>
              {/* Document Chunks */}
              <div id="chunk">
                <Tooltip delayDuration={250}>
                  <TooltipTrigger asChild>
                    <div className={toggleStyle}>🧱</div>
                  </TooltipTrigger>
                  <TooltipContent>Chunk</TooltipContent>
                </Tooltip>
              </div>
            </ToggleGroup>
            {/* Select chunk */}
            {toggleTextMode === 'chunk' && <Select value={selectedChunk} onChange={setSelectedChunk} items={chunkItems || []} placeholder="Select chunk" />}
            {/* Document/Chunk Output text */}
            <p className={descriptionStyle}>{documentText}</p>
          </div>
        </div>
      </div>
      :
      documentNotFound
  )

  const collectionPage =
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-8 p-8">
      {/* Collection info */}
      <div className="flex w-fit flex-col items-start justify-start gap-2">
        <div className={cn("self-center text-center", headingStyle)}>Collection</div>
        {/* Title */}
        <h1 className={subHeadingStyle} >{collectionName || "Explore files in this collection"}</h1>
        {/* Description */}
        <p className={descriptionStyle}>
          {collection?.metadata?.description || "Add a detailed description of the contents..."}
        </p>
        {/* Info */}
        <div className={subHeadingStyle}>Info</div>
        <div className="w-full flex-col flex-wrap items-center justify-between space-x-4">
          <p className={cn("flex flex-row flex-wrap gap-4", descriptionStyle)}>
            <span className="w-fit">📂 Documents: <span className="text-white">{collection?.metadata?.sources?.length || 0}</span></span>
            <span className="w-fit">📆 Last Modified: <span className="text-white">{collection?.metadata?.createdAt || "???"}</span></span>
          </p>
        </div>
        {/* Tags */}
        <div className={subHeadingStyle} >Tags</div>
        <div className={tagStyle}>
          {
            collectionTags?.length > 0 ?
              <RandomUnderlinedText className="text-muted-foreground" text={collectionTags} /> :
              <p className={descriptionStyle}>Add hashtags to link similar memories</p>
          }
        </div>
      </div>
      <Separator />
      {documentPage}
    </div>

  // Fetch data when mounted
  useEffect(() => {
    const action = async () => {
      if (!services) {
        const ss = await getServices()
        ss && setServices(ss)
      }
      const data = await fetchCollections()
      if (data) {
        setCollections(data)
        setMounted(true)
      }
    }
    if (!mounted) action()
  }, [fetchCollections, getServices, mounted, services, setCollections, setServices])

  // Reset data on page exit
  useEffect(() => {
    return () => {
      setDocuments([])
    }
  }, [setDocuments])

  return id ? collectionPage : collectionNotFound
}
