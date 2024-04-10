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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useHomebrew } from '@/lib/homebrew'
import { DialogShareCollection } from '@/components/features/crud/dialog-share-collection'
import { notifications } from '@/lib/notifications'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { MemoizedReactMarkdown } from '@/components/markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { CodeBlock } from '@/components/ui/codeblock'

export default function KnowledgeBasePage() {
  const {
    services,
    setServices,
    documents,
    setDocuments,
    setDocumentChunks,
    selectedDocumentId,
    collections,
    setCollections,
    selectedCollectionId,
    documentChunks,
    setSelectedDocumentId,
  } = useGlobalContext()
  const search = useSearchParams()
  const id = search.get('collectionId') || selectedCollectionId
  const router = useRouter()
  const { getServices } = useHomebrew()
  const { fetchCollections, copyId, fileExploreAction, shareMemory, deleteDocument, updateDocument } = useMemoryActions()
  const { RandomUnderlinedText } = useRenderText()
  // Data
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
  const documentText = document?.documents
  const description = document?.metadata?.description
  const documentChunkIds = document?.metadata?.chunk_ids ? JSON.parse(document?.metadata?.chunk_ids) : []
  const chunkItems = documentChunks?.map((ch: any, index) => ({ name: `Chunk: ${index + 1}`, value: ch.hash, text: ch.text }))
  const collectionName = collection?.name
  const collectionTags = collection?.metadata?.tags || ''
  // State
  const [mounted, setMounted] = useState(false)
  const [toggleTextMode, setToggleTextMode] = useState<string>('document')
  const [currentChunkItem, setCurrentChunkItem] = useState<any>(null)
  const [selectedChunk, setSelectedChunk] = useState<string | undefined>(undefined)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  // Styles
  const toggleStyle = cn("flex min-h-[5rem] min-w-[5rem] flex-col items-center justify-between gap-1 self-center rounded-lg p-2 text-center text-3xl")
  const headingStyle = cn("text-2xl font-bold")
  const subHeadingStyle = cn("text-lg font-semibold")
  const descriptionStyle = cn("text-md text-muted-foreground")
  const tagStyle = cn("flex flex-row flex-wrap items-center justify-start gap-2")

  // Render markdown string
  const mkdn = (text: string | undefined) => {
    return <MemoizedReactMarkdown
      className={cn("prose min-h-[16rem] w-full break-words rounded-md bg-muted p-4 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0", descriptionStyle)}
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')

          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        }
      }}
    >
      {text || ''}
    </MemoizedReactMarkdown>
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
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => fileExploreAction(document)}>Open</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => notifications().notAvailable()}>Edit</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => updateDocument(collectionName, document)}>Update</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => documentId && copyId(documentId)}>Copy Id</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => setShareDialogOpen(true)}>Share</Button>
          <ClearData
            className="w-fit p-5 text-lg"
            variant="destructive"
            action={async () => {
              await deleteDocument(collectionName, document)
              // Reset data
              setCurrentChunkItem(null)
              setSelectedChunk('')
              setDocuments([])
              setDocumentChunks([])
              setSelectedDocumentId('')
              return true
            }}
            actionTitle="Delete"
          />
        </div>
        <div className="flex h-full w-full flex-col items-stretch justify-center gap-8 overflow-hidden md:flex-row">
          {/* Document info */}
          <div className="flex w-fit flex-1 flex-col items-start justify-start gap-3">
            <h1 className={cn(subHeadingStyle, "text-xl underline")}>{documentName || 'No title'}</h1>
            <p className={descriptionStyle}>{description || 'No description'}</p>
            <div className={subHeadingStyle}>Info</div>
            <p className={descriptionStyle}>🍪: {documentChunkIds?.length || 0}</p>
            {documentTags && <div className={tagStyle}>🔖: {<RandomUnderlinedText className="text-muted-foreground" text={documentTags || ''} /> || 'Add some tags'}</div>}
            <p className={descriptionStyle}>📅: {documentDate}</p>
            <p className={descriptionStyle}>📄: {documentFileName}</p>
            <p className={descriptionStyle}>📁: {documentPath}</p>
            {documentUrlPath && <p className={descriptionStyle}>🌐: {documentUrlPath}</p>}
            {documentType && <p className={descriptionStyle}>💾: {documentType}</p>}
          </div>
          {/* Separator */}
          <div className="flex flex-col items-center justify-center border-0 border-t-2 md:border-l-2"></div>
          {/* Document Text/Chunks */}
          <div className="mb-16 flex flex-1 flex-col items-center justify-start gap-4 overflow-hidden px-1">
            <h1 className={subHeadingStyle}>View document content</h1>
            {/* Toggle Group */}
            <ToggleGroup
              label="Text Mode"
              value={toggleTextMode}
              onChange={setToggleTextMode}
              className="rounded-xl"
            >
              {/* Document Text */}
              <div id="document" className={toggleStyle}>📄<p className="text-xs">Document</p></div>
              {/* Document Chunks */}
              <div id="chunk" className={toggleStyle}>🍪<p className="text-xs">Chunks</p></div>
            </ToggleGroup>

            {/* Select chunk */}
            {toggleTextMode === 'chunk' && <Select value={selectedChunk} onChange={setSelectedChunk} items={chunkItems || []} placeholder="Select chunk" />}
            {/* Document/Chunk Output text */}
            {toggleTextMode === 'document' ?
              mkdn(documentText)
              :
              mkdn(currentChunkItem?.text)
            }
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
        {/* Pop-up Action Menus */}
        <DialogShareCollection
          action={shareMemory}
          dialogOpen={shareDialogOpen}
          setDialogOpen={setShareDialogOpen}
          name={collection?.name}
          sharePath={collection?.metadata?.sharePath}
          createdAt={collection?.metadata?.createdAt}
          sources={collection?.metadata?.sources || []}
        />
        {/* Header */}
        <div className={cn("self-center pb-4 text-center", headingStyle)}>Collection</div>
        {/* Actions */}
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2 overflow-hidden pb-4">
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => notifications().notAvailable()}>Edit</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => copyId(id)}>Copy Id</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => setShareDialogOpen(true)}>Share</Button>
        </div>
        {/* Title */}
        <h1 className={cn(subHeadingStyle, "text-xl underline")} >{collectionName || "Explore files in this collection"}</h1>
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

  // Update displayed chunk when selected chunk is changed
  useEffect(() => {
    const item = documentChunks.find(ch => ch.hash === selectedChunk)
    setCurrentChunkItem(item)
  }, [documentChunks, selectedChunk])

  // Reset data on page exit
  useEffect(() => {
    return () => {
      setDocuments([])
      setDocumentChunks([])
    }
  }, [setDocumentChunks, setDocuments])

  return id ? collectionPage : collectionNotFound
}
