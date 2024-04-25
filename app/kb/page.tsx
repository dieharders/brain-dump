'use client'

import { useEffect, useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { I_Collection, I_DocumentChunk, useHomebrew } from '@/lib/homebrew'
import { notifications } from '@/lib/notifications'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRenderText } from '@/components/ui/useRenderText'
import { Select } from '@/components/ui/select'
import ToggleGroup from '@/components/ui/toggle-group'
import { useMemoryActions } from '@/components/features/crud/actions'
import { DialogShareCollection } from '@/components/features/crud/dialog-share-collection'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { CodeBlock } from '@/components/ui/codeblock'

export default function KnowledgeBasePage() {
  const {
    setServices,
    documents,
    setDocuments,
    selectedDocumentId,
    collections,
    setCollections,
    chunks,
    selectedCollectionName,
    setSelectedDocumentId,
  } = useGlobalContext()
  const search = useSearchParams()
  const id = search.get('collectionName') || selectedCollectionName
  const router = useRouter()
  const { getServices } = useHomebrew()
  const { fetchCollections, copyId, fileExploreAction, shareMemory, deleteSource, updateDocument } = useMemoryActions()
  const { RandomUnderlinedText } = useRenderText()
  // Data
  const collection = collections?.find((c: I_Collection) => c.name === id)
  const document = documents?.find?.(d => d?.id === selectedDocumentId)
  const documentName = document?.name
  const documentId = document?.id
  const documentFileName = document?.fileName
  const documentTags = document?.tags
  const documentDate = document?.createdAt
  const documentType = document?.fileType
  const documentSize = document?.fileSize || 0
  const documentPath = document?.filePath
  const documentUrlPath = document?.urlPath
  const description = document?.description
  const numDocumentChunks = document?.chunkIds?.length || 0
  const documentText = () => chunks?.map(ch => ch.text).join('')
  const chunkItems = () => chunks?.map((ch, index) => ({ name: `Chunk: ${index + 1}`, value: ch.id, text: ch.text }))
  const collectionName = collection?.name
  const collectionTags = collection?.metadata?.tags || ''
  // State
  const [mounted, setMounted] = useState(false)
  const [toggleTextMode, setToggleTextMode] = useState<string>('document')
  const [currentChunkItem, setCurrentChunkItem] = useState<I_DocumentChunk | null>(null)
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

        <div className="flex h-full w-full flex-col items-stretch justify-center gap-8 overflow-hidden lg:flex-row">
          {/* Document info */}
          <div className="flex h-fit w-full flex-1 flex-col items-center justify-start gap-8">
            {/* Actions */}
            <h1 className={cn(subHeadingStyle, "text-xl underline")}>{documentName || 'No title'}</h1>
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
                  await deleteSource(collectionName, document)
                  // Reset data
                  setCurrentChunkItem(null)
                  setSelectedChunk('')
                  setDocuments([])
                  setSelectedDocumentId('')
                  return true
                }}
                actionTitle="Delete"
              />
            </div>
            <div className="flex w-fit min-w-[24rem] max-w-[36rem] flex-1 flex-col items-start justify-start gap-3 rounded-lg bg-muted p-8">
              <h1 className={subHeadingStyle}>Description</h1>
              <p className={descriptionStyle}>{description || 'No description.'}</p>
              <div className={subHeadingStyle}>Info</div>
              <p className={descriptionStyle}>🍪 <span className="text-primary">Chunks:</span> {numDocumentChunks}</p>
              {documentTags && <div className={tagStyle}>🔖 <span className="text-primary">Tags:</span> {<RandomUnderlinedText className="text-muted-foreground" text={documentTags || ''} /> || 'Add some tags'}</div>}
              {documentType && <p className={descriptionStyle}>💾 <span className="text-primary">File type:</span> {documentType}</p>}
              <p className={descriptionStyle}>#️⃣ <span className="text-primary">File size:</span> {documentSize}</p>
              <p className={descriptionStyle}>📅 <span className="text-primary">Created:</span> {documentDate}</p>
              <p className={descriptionStyle}>📄 <span className="text-primary">File name:</span> {documentFileName}</p>
              {documentUrlPath && <p className={descriptionStyle}>🌐 <span className="text-primary">Url:</span> {documentUrlPath}</p>}
              <p className={descriptionStyle}>📁 <span className="text-primary">Location:</span> {documentPath}</p>
            </div>
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
            {toggleTextMode === 'chunk' && <Select value={selectedChunk} onChange={setSelectedChunk} items={chunkItems() || []} placeholder="Select chunk" />}
            {/* Document/Chunk Output text */}
            {toggleTextMode === 'document' ?
              mkdn(documentText())
              :
              mkdn(currentChunkItem?.text || 'No chunk data found...')
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
          numSources={collection?.metadata?.sources.length || 0}
        />
        {/* Header */}
        <div className={cn("self-center pb-4 text-center", headingStyle)}>Collection</div>
        {/* Actions */}
        <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2 overflow-hidden pb-4">
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => notifications().notAvailable()}>Edit</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => copyId(id)}>Copy Id</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => setShareDialogOpen(true)}>Share</Button>
        </div>
        <div className="flex w-fit max-w-[40rem] flex-col items-start justify-start gap-2 rounded-lg bg-muted p-8">
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
              <span className="w-fit">📂 <span className="text-primary">Documents:</span> {collection?.metadata?.sources.length || 0}</span>
              <span className="w-fit">📆 <span className="text-primary">Created:</span> {collection?.metadata?.createdAt || "?"}</span>
            </p>
          </div>
          {/* Tags */}
          <div className={subHeadingStyle} >Tags</div>
          <div className={tagStyle}>
            {
              collectionTags?.length > 0 ?
                <RandomUnderlinedText className="text-muted-foreground" text={collectionTags} /> :
                <p className={descriptionStyle}>Add hashtags to link similar memories...</p>
            }
          </div>
        </div>
      </div>
      <Separator />
      {documentPage}
    </div>

  // Fetch data when mounted
  useEffect(() => {
    const action = async () => {
      setMounted(true)
      const ss = await getServices()
      ss && setServices(ss)
    }
    if (!mounted) action()
  }, [getServices, mounted, setServices])

  // Fetch data when mounted
  useEffect(() => {
    const action = async () => {
      const data = await fetchCollections()
      if (data) setCollections(data)
    }
    action()
  }, [fetchCollections, setCollections])

  // Update displayed chunk when selected chunk is changed
  useEffect(() => {
    const item = chunks?.find(ch => ch.id === selectedChunk)
    item && setCurrentChunkItem(item)
  }, [chunks, selectedChunk, selectedDocumentId])

  // Reset chunk displayed when document changed
  useEffect(() => {
    setCurrentChunkItem(null)
    setSelectedChunk('')
  }, [document])

  // Reset data on page exit
  useEffect(() => {
    return () => {
      setDocuments([])
    }
  }, [setDocuments])

  return (id && collections.length) ? collectionPage : collectionNotFound
}
