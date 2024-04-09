'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FileTextIcon, VideoIcon, SpeakerLoudIcon, CodeIcon, QuestionMarkIcon } from '@radix-ui/react-icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Document } from '@/lib/homebrew'

const iconLookUp: { [key: string]: any } = {
  'text': () => '📄',//FileTextIcon,
  'video': VideoIcon,
  'audio': () => '🔊',//SpeakerLoudIcon,
  'code': CodeIcon,
}

interface I_Props {
  document: I_Document
  numChunks: number
  isActive?: boolean
  isSelected?: boolean
  onClick?: () => void
}

/**
 * A card container for document
 */
export const CardDocument = (props: I_Props) => {
  const { document, numChunks, onClick, isSelected, isActive: isHighlighted } = props
  const [isActive, setIsActive] = useState(false)
  const numTags = document?.metadata?.tags?.split(' ').length || 0
  const description = document?.metadata?.description || 'No description...'
  const name = document?.metadata?.name || 'No title'
  const createdAt = document?.metadata?.createdAt || '???'
  const documentType = document?.metadata?.type || 'text'
  const Icon = iconLookUp[documentType || ''] || QuestionMarkIcon

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'hover-bg-accent relative h-fit w-full select-none flex-col space-y-4 py-3 text-left',
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
        <span className="h-100 my-auto w-full overflow-hidden text-ellipsis whitespace-nowrap">
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
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
              🍪: {numChunks}
            </span>
          </TooltipTrigger>
          <TooltipContent>Chunks</TooltipContent>
        </Tooltip>

        {/* Type of Document */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
              {/* <Icon />:{documentType.toUpperCase()} */}
              <Icon className="inline-block" /><div className="inline-block">:{' '}{documentType.toUpperCase()}</div>
            </span>
          </TooltipTrigger>
          <TooltipContent>Document Type: {documentType}</TooltipContent>
        </Tooltip>

        {/* Number of metadata tags */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
              🔖: {numTags}
            </span>
          </TooltipTrigger>
          <TooltipContent>Tags</TooltipContent>
        </Tooltip>

        {/* Creation date */}
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
              📆: ?
            </span>
          </TooltipTrigger>
          <TooltipContent>Created at {createdAt}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
