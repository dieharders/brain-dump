'use client'

import { useEffect, useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { I_Collection, I_DocumentChunk, useHomebrew } from '@/lib/homebrew'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRenderText } from '@/components/ui/useRenderText'
import { Select } from '@/components/ui/select'
import ToggleGroup from '@/components/ui/toggle-group'
import { useMemoryActions } from '@/components/features/crud/actions'
import { MemoizedReactMarkdown } from '@/components/ui/markdown'
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
    setSelectedCollectionName,
  } = useGlobalContext()
  const search = useSearchParams()
  const id = search.get('collectionName') || selectedCollectionName || ''
  const router = useRouter()
  const { getServices } = useHomebrew()
  const { fetchCollections } = useMemoryActions()
  const { RandomUnderlinedText } = useRenderText()
  // Data
  const collection = collections?.find((c: I_Collection) => c.name === id)
  const document = documents?.find?.(d => d?.id === selectedDocumentId)
  const documentName = document?.document_name
  const documentFileName = document?.source_file_name
  const documentTags = document?.tags
  const documentDate = document?.created_at
  const documentType = document?.file_type
  const documentSize = document?.file_size || 0
  const documentPath = document?.file_path
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
  // Styles
  const toggleStyle = cn('flex min-h-[5rem] min-w-[5rem] flex-col items-center justify-between gap-1 self-center rounded-lg p-2 text-center text-3xl')
  const headingStyle = cn('text-2xl font-bold')
  const subHeadingStyle = cn('text-lg font-semibold')
  const descriptionStyle = cn('text-md break-all text-muted-foreground saturate-50')
  const tagStyle = cn('flex flex-row flex-wrap items-center justify-start gap-2')

  // Render markdown string
  const mkdn = (text: string | undefined) => {
    return <MemoizedReactMarkdown
      className={cn('prose min-h-[16rem] w-full rounded-md p-4 dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 sm:bg-muted', descriptionStyle, 'break-words')}
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
      {/* @TODO Make this a button that can open the menu */}
      <p className={descriptionStyle}>
        {'Try selecting a document from the "Documents" button on the header.'}
      </p>
    </div>
  )

  const documentPage = (
    document ?
      <div className="flex w-full flex-1 flex-col items-center justify-start gap-8">
        <div className={cn('w-full self-center text-center', headingStyle)}>Document</div>

        <div className="flex h-full w-full flex-col items-stretch justify-center gap-8 overflow-hidden lg:flex-row">
          {/* Document info */}
          <div className="flex h-fit w-full flex-1 flex-col items-center justify-start gap-8">
            <h1 className={cn(subHeadingStyle, 'text-center text-xl')}>Document Info</h1>
            {/* Form */}
            <div className="flex w-full flex-1 flex-col items-start justify-start gap-3 rounded-lg p-4 sm:max-w-[34rem] sm:bg-muted">
              <div className={subHeadingStyle}>Title</div>
              <p className={descriptionStyle}>{documentName || 'No title'}</p>
              <div className={subHeadingStyle}>Description</div>
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
          <div className="mb-16 flex flex-1 flex-col items-center justify-start gap-8 overflow-hidden px-1">
            <h1 className={cn(subHeadingStyle, 'text-center text-xl')}>Document Content</h1>
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
            {toggleTextMode === 'chunk' &&
              <Select
                value={selectedChunk}
                onChange={setSelectedChunk}
                items={chunkItems() || []}
                placeholder="Select chunk"
                className="max-w-[16rem]"
              />
            }
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
    <div className="flex h-full w-full flex-1 flex-col items-center justify-start gap-8 py-8 sm:p-8">
      {/* Collection info */}
      <div className="flex w-full flex-col items-start justify-start gap-2 sm:w-fit">
        {/* Pop-up Action Menus */}
        {/* <DialogShareCollection
          action={shareMemory}
          dialogOpen={shareDialogOpen}
          setDialogOpen={setShareDialogOpen}
          name={collection?.name}
          sharePath={collection?.metadata?.sharePath}
          createdAt={collection?.metadata?.createdAt}
          numSources={collection?.metadata?.sources.length || 0}
        /> */}
        {/* Header */}
        <div className={cn('self-center pb-4 text-center', headingStyle)}>Collection</div>
        {/* Actions */}
        {/* <div className="flex w-full flex-row flex-wrap items-center justify-center gap-2 overflow-hidden pb-4">
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => notifications().notAvailable()}>Edit</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => copyId(id)}>Copy Id</Button>
          <Button variant="outline" className="w-fit p-5 text-lg" onClick={() => setShareDialogOpen(true)}>Share</Button>
        </div> */}
        {/* Form */}
        <div className="flex w-full flex-col items-start justify-start gap-2 rounded-lg p-4 sm:max-w-[34rem] sm:bg-muted">
          {/* Title */}
          <div className={subHeadingStyle}>Title</div>
          <div className={descriptionStyle} >{collectionName || 'Explore files in this collection'}</div>
          {/* Description */}
          <div className={subHeadingStyle}>Description</div>
          <p className={descriptionStyle}>
            {collection?.metadata?.description || 'Add a detailed description for the contents of this collection.'}
          </p>
          {/* Tags */}
          <div className={subHeadingStyle} >Tags</div>
          <div className={tagStyle}>
            {
              collectionTags?.length > 0 ?
                <RandomUnderlinedText className="text-muted-foreground" text={collectionTags} /> :
                <p className={descriptionStyle}>Add hashtags to categorize collections.</p>
            }
          </div>
          {/* Info */}
          <div className={subHeadingStyle}>Info</div>
          <div className="w-full flex-col flex-wrap items-center justify-between space-x-4">
            <p className={cn('flex flex-row flex-wrap gap-4', descriptionStyle)}>
              <span className="w-fit">📂 <span className="text-primary">Documents:</span> {collection?.metadata?.sources.length || 0}</span>
              <span className="w-fit">📆 <span className="text-primary">Created:</span> {collection?.metadata?.createdAt || '?'}</span>
            </p>
          </div>
        </div>
      </div>
      <Separator />
      {documentPage}
    </div>

  // Set selected collection on mount
  useEffect(() => {
    setSelectedCollectionName(id)
  }, [id, setSelectedCollectionName])

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
  }, [chunks, selectedChunk])

  // Reset displayed chunk if document changes
  useEffect(() => {
    if (!chunks?.find(ch => ch.id === selectedChunk)) {
      setCurrentChunkItem(null)
      setSelectedChunk('')
    }
  }, [chunks, selectedChunk])

  // Reset data on page exit
  useEffect(() => {
    return () => {
      setDocuments([])
    }
  }, [setDocuments])

  return (id && collections.length) ? collectionPage : collectionNotFound
}
