'use client'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconMessage, IconUsers } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCallback } from 'react'
import { useGlobalContext } from '@/contexts'
import { I_Thread } from '@/lib/homebrew'

interface SidebarItemProps {
  chat: I_Thread
  children: React.ReactNode
}

export const SidebarItem = ({ chat, children }: SidebarItemProps) => {
  const { currentThreadId, threads, setCurrentMessages, isAiThinking } = useGlobalContext()
  const isActive = currentThreadId.current === chat.id

  const selectThreadAction = useCallback(async (id: string) => {
    if (currentThreadId.current === id) return
    currentThreadId.current = id
    // Update messages list
    if (!isAiThinking) {
      const msgs = threads.find(t => t.id === currentThreadId.current)?.messages
      msgs && setCurrentMessages(msgs)
    }
    return
  }, [currentThreadId, threads, setCurrentMessages, isAiThinking])

  if (!chat?.id) return null

  return (
    <div className="relative">
      <div
        onMouseDown={() => selectThreadAction(chat?.id)}
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'relative flex h-8 w-full min-w-[18rem] flex-1 cursor-pointer overflow-hidden pl-8 pr-2 text-left',
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
          {chat?.sharePath ? (
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
      </div>
    </div>
  )
}
