'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconBrain } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Collection } from '@/lib/homebrew'
import Link from 'next/link'

interface SidebarItemProps {
  collection: I_Collection
  onClick?: (open: boolean) => void
  children: React.ReactNode
}

/**
 * A container for collection of documents
 */
export const CollectionCard = (props: SidebarItemProps) => {
  const { collection, onClick, children } = props
  const [isActive, setIsActive] = useState(false)
  const numFavorites = collection?.metadata?.favorites || 0
  const numTags = collection?.metadata?.tags?.split(' ').length || 0
  const numSources = collection?.metadata?.sources?.length || 0
  const createdAt = collection?.metadata?.createdAt || '???'

  return (
    <div
      onClick={() => onClick && onClick(true)}
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
      className="relative"
    >
      {/* Card button */}
      <Link
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'hover-bg-accent relative h-fit w-full select-none flex-col space-y-4 py-3 text-left',
          isActive && 'bg-accent',
        )}
        href="/"
      >
        {/* Header */}
        <div className="flex w-full items-stretch overflow-hidden">
          {/* Icon */}
          <div className="h-100 flex cursor-pointer items-center justify-center">
            <Tooltip delayDuration={1000}>
              <TooltipTrigger
                tabIndex={-1}
                className="focus:bg-muted focus:ring-1 focus:ring-ring"
              >
                <IconBrain className="mr-2" />
              </TooltipTrigger>
              <TooltipContent>Collection</TooltipContent>
            </Tooltip>
          </div>
          {/* Card name */}
          <span className="h-100 my-auto w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {collection.name}
          </span>
          {/* Button actions */}
          <span className="flex h-8 w-fit items-center">{isActive && children}</span>
        </div>

        {/* Description */}
        <div className="my-2 flex max-h-16 w-full flex-1 overflow-hidden text-left text-slate-500">
          {/* Card name */}
          <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
            {collection.metadata?.description || 'No description...'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex h-fit w-full justify-between space-x-4 text-gray-400">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
                📂: {numSources}
              </span>
            </TooltipTrigger>
            <TooltipContent>Sources</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
                ⭐: {numFavorites}
              </span>
            </TooltipTrigger>
            <TooltipContent>Favorites</TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={1000}>
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

          <Tooltip delayDuration={1000}>
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
      </Link>
    </div>
  )
}
