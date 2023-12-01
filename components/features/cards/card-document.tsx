'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { I_Document } from "@/lib/homebrew"
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IconDocument } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  IconExternalLink,
  IconRefresh,
  IconTrash,
} from '@/components/ui/icons'

interface I_Props {
  document: I_Document
  index: number
  fileExploreAction: (document: I_Document) => Promise<void>
  deleteAction: (document: I_Document, index: number) => Promise<void>
  updateAction: (document: I_Document) => Promise<void>
}

const DocumentCard = ({ document, index, fileExploreAction, updateAction, deleteAction }: I_Props) => {
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const defaultGray = 'text-gray-400'
  const metaLen = document.metadata.tags.length
  const tagColor = metaLen ? 'text-white' : defaultGray
  const tagUnderline = metaLen ? 'underline decoration-2' : ''
  const tagUnderlineColorTable = ['decoration-white-500', 'decoration-indigo-500', 'decoration-cyan-500', 'decoration-green-500', 'decoration-pink-500', 'decoration-purple-500', 'decoration-fuchsia-500', 'decoration-blue-500', 'decoration-yellow-500', 'decoration-orange-500', 'decoration-sky-500']
  const [randIndex, setRandIndex] = useState<number>(-1)

  const getOffsetIndex = (arr: string[], index: number, offset: number) => {
    const newIndex = index + offset

    if (newIndex >= 0 && newIndex < arr.length) {
      return newIndex
    }

    // Handle cases where the new index goes outside array bounds
    if (newIndex < 0) {
      return 0 // Adjust to the first index
    } else {
      return arr.length - 1 // Adjust to the last index
    }
  }

  const getRandomTagColor = (index: number, table: string[]) => {
    if (metaLen === 0) return defaultGray
    const offsetIndex = getOffsetIndex(table, index, randIndex)
    const randColor = table[offsetIndex]

    return randColor
  }

  const renderTags = (tags: string) => {
    const result = tags.split(' ').map((tag, index) => {
      return (
        <p key={tag} className={`${tagColor} ${tagUnderline} max-w-8 w-fit overflow-hidden text-ellipsis whitespace-nowrap text-left font-semibold ${getRandomTagColor(index, tagUnderlineColorTable)}`}>
          {tag || "Add some hashtags..."}
        </p>
      )
    })
    return result
  }

  const toolButtons = (
    <>
      {/* File Explorer Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            disabled={isProcessing}
            onClick={async () => {
              setIsProcessing(true)
              await fileExploreAction(document)
              setIsProcessing(false)
            }}
          >
            <IconExternalLink />
            <span className="sr-only">Open source file</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open file in explorer</TooltipContent>
      </Tooltip>
      {/* Update Memory Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            disabled={isProcessing}
            onClick={async () => {
              setIsProcessing(true)
              await updateAction(document)
              setIsProcessing(false)
            }}
          >
            <IconRefresh />
            <span className="sr-only">Update memory</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Update</TooltipContent>
      </Tooltip>
      {/* Delete Document Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-background"
            disabled={isProcessing}
            onClick={async () => {
              setIsProcessing(true)
              await deleteAction(document, index)
              setIsProcessing(false)
            }}
          >
            <IconTrash />
            <span className="sr-only">Delete file</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </>
  )

  // Set a random number for this document to offset the color index
  // This way tags colors dont all look the same
  useEffect(() => {
    const max = 10
    const randomIndex = Math.floor((Math.random() * max))
    if (randIndex === -1) setRandIndex(randomIndex)
  }, [randIndex])

  return (
    <div
      className="w-full"
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
    >
      <Link
        className={cn(
          buttonVariants({ variant: 'secondary' }),
          'hover-bg-accent relative h-[10rem] w-full select-none flex-col overflow-hidden px-4',
        )}
        href="/"
      >
        {/* Header */}
        <div className="flex h-fit w-full flex-row overflow-hidden">
          {/* File type icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mr-2 flex w-4 cursor-pointer items-center justify-self-start">
                <IconDocument className="h-4" />
                <span className="sr-only">File type: document</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Document</TooltipContent>
          </Tooltip>
          {/* Title */}
          <span className="w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-lg uppercase">
            {document.metadata.name}
          </span>
          {/* Button actions toolbar */}
          {isActive && (
            <div className="flex items-center justify-between space-x-1 justify-self-end">
              {toolButtons}
            </div>
          )}
        </div>
        {/* Description */}
        <p className="text-md line-clamp-2 h-full w-full flex-1 overflow-hidden text-ellipsis py-2 text-left text-gray-400">
          {document.metadata.description || "Add a description..."}
        </p>
        {/* Tags */}
        <span className="flexwrap flex w-full flex-row justify-start space-x-2 overflow-hidden py-1 text-gray-400">🔖:&nbsp;{renderTags(document.metadata.tags)}</span>
        {/* Other info */}
        <span className="h-fit w-full py-2 text-left text-sm text-gray-400">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">📅:{' '}{document.metadata.createdAt || "???"}</p>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">📁:{' '}{document.metadata.filePath || "???"}</p>
        </span>
      </Link>
    </div>
  )
}

export default DocumentCard
