'use client'

import { useState } from "react"
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

  return (
    <div
      className="relative flex-1 overflow-auto"
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
          'hover-bg-accent relative h-full w-full select-none flex-col overflow-hidden px-4',
        )}
        href="/"
      >
        <div className="flex h-8 w-full overflow-hidden">
          {/* File type icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-6 cursor-pointer items-center justify-self-start">
                <IconDocument className="mb-1 h-6" />
                <span className="sr-only">File type: document</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Document</TooltipContent>
          </Tooltip>
          {/* Title */}
          <span className="w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xl">
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
        <p className="text-md h-auto max-h-16 w-full overflow-hidden py-1 text-left">
          {document.metadata.description}
        </p>
        {/* Tags */}
        <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap py-1 text-left font-semibold">
          {document.metadata.tags}
        </p>
      </Link>

    </div>
  )
}

export default DocumentCard