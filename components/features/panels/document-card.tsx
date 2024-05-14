'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Source } from '@/lib/homebrew'

interface I_Props {
  document: I_Source
  numChunks: number
  isActive?: boolean
  isSelected?: boolean
  onClick?: () => void
}

/**
 * A card container for document
 */
export const DocumentCard = (props: I_Props) => {
  const { document, numChunks, onClick, isSelected, isActive: isHighlighted } = props
  const [isActive, setIsActive] = useState(false)
  const numTags = document?.tags ? document?.tags?.split(' ').length : 0
  const description = document?.description || 'No description.'
  const name = document?.name || 'No title'
  const createdAt = document?.createdAt || '?'
  const documentType = document?.fileType || '?'
  const toolTipStyle = cn("min-w-4 focus:bg-muted focus:ring-1 focus:ring-ring")
  const labelStyle = cn("max-w-14 w-full truncate")

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'hover-bg-accent relative h-fit w-full select-none flex-col space-y-4 py-4 text-left',
        (isActive || isHighlighted) && 'bg-accent',
        isSelected && 'bg-accent',
        onClick && 'cursor-pointer',
      )}
      onClick={e => {
        e.preventDefault()
        onClick && onClick()
      }}
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
    >
      {/* Header */}
      <div className="flex w-full items-stretch overflow-hidden">
        {/* Card name */}
        <span className="h-100 my-auto w-full truncate">
          {name}
        </span>
      </div>

      {/* Description */}
      <div className="my-2 flex max-h-16 w-full flex-1 overflow-hidden text-left text-slate-500">
        {/* Card name */}
        <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
          {description}
        </span>
      </div>

      {/* Stats */}
      <div className="flex h-fit w-full justify-between space-x-4 text-gray-400">
        {/* Parts of the document */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className={toolTipStyle}
          >
            <div className={labelStyle}>
              🍪: {numChunks}
            </div>
          </TooltipTrigger>
          <TooltipContent>Chunks: {numChunks}</TooltipContent>
        </Tooltip>

        {/* Type of Document */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className={toolTipStyle}
          >
            <div className={labelStyle}>
              <div className="inline-block" >💾<div className="inline-block">:{' '}{documentType}</div></div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Document type: {documentType}</TooltipContent>
        </Tooltip>

        {/* Number of metadata tags */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className={toolTipStyle}
          >
            <div className={labelStyle}>
              🔖: {numTags}
            </div>
          </TooltipTrigger>
          <TooltipContent>Tag count: {numTags}</TooltipContent>
        </Tooltip>

        {/* Creation date */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className={toolTipStyle}
          >
            <div className="max-w-[4rem] truncate">
              📆: {createdAt}
            </div>
          </TooltipTrigger>
          <TooltipContent>Created: {createdAt}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
