'use client'

import { useState } from 'react'
import { type Brain } from '@/lib/types'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconUsers, IconBrain } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'

interface SidebarItemProps {
  brain: Brain
  children: React.ReactNode
}

export function SidebarItem({ brain, children }: SidebarItemProps) {
  const [isActive, setIsActive] = useState(false)

  if (!brain?.id) return null

  return (
    <div
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
          'hover-bg-accent relative flex h-8 w-full flex-1 select-none overflow-hidden pl-8 pr-2 text-left',
          isActive && 'bg-accent',
        )}
        href="/"
      >
        {/* Card name */}
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {brain.title}
        </span>
        {/* Button actions */}
        {isActive && <span className="w-full">{children}</span>}
      </Link>
      {/* Icon */}
      <div className="pointer-events-none absolute left-2 top-2 flex w-6 items-center justify-center">
        {brain.sharePath ? (
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
