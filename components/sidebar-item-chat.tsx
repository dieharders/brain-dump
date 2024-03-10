'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconMessage, IconUsers } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarItemProps {
  chat: Chat
  children: React.ReactNode
}

export function SidebarItem({ chat, children }: SidebarItemProps) {
  const pathname = usePathname()
  const isActive = pathname === chat.path

  if (!chat?.id) return null

  return (
    <div className="relative">
      {/* @TODO This may be causing premature fetches of chat data each time we hover over links */}
      <Link
        href={chat.path}
        prefetch={false}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'relative flex h-8 w-full flex-1 overflow-hidden pl-8 pr-2 text-left',
          isActive && 'bg-accent',
        )}
      >
        {/* Chat title */}
        <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
          {chat.title}
        </span>
        {/* Action buttons */}
        {isActive && <div className="w-fit">{children}</div>}
        {/* Convo type icon */}
        <div className="absolute left-2 top-1 flex h-6 w-6 items-center justify-center">
          {chat.sharePath ? (
            <Tooltip delayDuration={350}>
              <TooltipTrigger
                tabIndex={-1}
                className="focus:bg-muted focus:ring-1 focus:ring-ring"
              >
                <IconUsers className="mr-2" />
              </TooltipTrigger>
              <TooltipContent>This is a shared chat.</TooltipContent>
            </Tooltip>
          ) : (
            <IconMessage className="mr-2" />
          )}
        </div>
      </Link>
    </div>
  )
}
