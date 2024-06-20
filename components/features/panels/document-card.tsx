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
  children?: React.ReactNode
  className?: string
}

/**
 * A card container for document.
 * @TODO combine with collection-card
 */
export const DocumentCard = (props: I_Props) => {
  const { document, numChunks, onClick, isSelected, isActive: isHighlighted, className, children } = props
  const [isActive, setIsActive] = useState(false)
  const numTags = document?.tags ? document?.tags?.split(' ').length : 0
  const description = document?.description || 'No description.'
  const name = document?.name || 'No title'
  const createdAt = document?.createdAt || '?'
  const documentType = document?.fileType || '?'
  const toolTipStyle = cn("w-full overflow-hidden")
  const labelStyle = cn("justify-left flex")

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'hover-bg-accent relative flex h-fit min-h-[9rem] w-full select-none flex-col space-y-4 overflow-hidden py-4 text-left sm:w-[20rem]',
        className,
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
        {/* Icon */}
        <div className="h-100 flex cursor-pointer items-center justify-center">
          <Tooltip delayDuration={350}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <div className="mr-2">📄</div>
            </TooltipTrigger>
            <TooltipContent>Source Document</TooltipContent>
          </Tooltip>
        </div>

        {/* Card name */}
        <span className="h-100 my-auto w-full truncate">
          {name}
        </span>

        {/* Render action buttons when clicked and active */}
        <span className="flex h-8 w-fit items-center">
          {isHighlighted && children}
        </span>
      </div>

      {/* Description */}
      <div className="flex h-fit w-full text-left text-slate-500 overflow-hidden">
        <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
          {description}
        </span>
      </div>

      {/* Stats */}
      <div className="flex h-fit w-full justify-between space-x-2 overflow-hidden text-gray-400">
        {/* Parts of the document */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className={toolTipStyle}
          >
            <div className={labelStyle}>
              <p className="truncate">🍪{numChunks}</p>
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
              <p className="truncate">💾{documentType}</p>
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
              <p className="truncate">🔖{numTags}</p>
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
            <div className={labelStyle}>
              <p className="truncate">📆{createdAt}</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>Created: {createdAt}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
