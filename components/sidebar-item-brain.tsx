'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconUsers, IconBrain } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Collection } from '@/lib/homebrew'
import Link from 'next/link'

interface SidebarItemProps {
  collection: I_Collection
  onClick: (open: boolean) => void
  children: React.ReactNode
}

/**
 * A container for collection of documents
 */
export function SidebarItem(props: SidebarItemProps) {
  const { collection, onClick, children } = props
  const [isActive, setIsActive] = useState(false)
  const numFavorites = collection?.metadata?.favorites || 0
  const numTags = collection?.metadata?.tags?.split(' ').length || 0
  const numSources = collection?.metadata?.sources?.length || 0
  const hasDescription = collection?.metadata?.description ? '✔' : '❌'

  return (
    <div
      onClick={() => onClick(true)}
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
          'hover-bg-accent relative h-fit w-full select-none flex-col space-y-1 pl-8 pr-2 text-left',
          isActive && 'bg-accent',
        )}
        href="/"
      >
        <div className="flex w-full flex-1 overflow-hidden">
          {/* Card name */}
          <span className="m-0 h-6 w-full overflow-hidden text-ellipsis whitespace-nowrap">
            {collection.name}
          </span>
          {/* Button actions */}
          {isActive && <span className="m-0 h-6 w-fit">{children}</span>}
        </div>
        {/* Stats */}
        <div className="flex h-fit w-full justify-start space-x-4 text-gray-400">
          <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
            📂: {numSources}
          </span>
          <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
            ⭐: {numFavorites}
          </span>
          <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
            🔖: {numTags}
          </span>
          <span className="max-w-12 overflow-hidden text-ellipsis whitespace-nowrap">
            📄: {hasDescription}
          </span>
        </div>
      </Link>
      {/* Icon */}
      <div className="absolute left-2 top-3 flex w-6 cursor-pointer items-center justify-center">
        {collection.metadata?.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <IconUsers className="mr-2" />
            </TooltipTrigger>
            <TooltipContent>This is a shared brain.</TooltipContent>
          </Tooltip>
        ) : (
          <IconBrain className="mr-2" />
        )}
      </div>
    </div>
  )
}
