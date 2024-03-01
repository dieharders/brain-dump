'use client'

import { Session } from 'next-auth'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChatsButton } from '@/components/features/panels/chats-panel-button'
import { CollectionsButton } from '@/components/features/panels/collections-panel-button'
import { usePathname } from 'next/navigation'

export const MenuPanelTriggers = ({ session }: { session: Session }) => {
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const header_url = routeId || 'home'
  const showKB = header_url === 'knowledge'
  const showChatThreads = header_url === 'bot' || header_url === 'playground'

  return (
    <div className="flex items-center">
      {/* Chats Pane Button */}
      {showChatThreads &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <div>
              <ChatsButton session={session} />
              <span className="sr-only">Chat History</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Chat Threads</TooltipContent>
        </Tooltip>
      }

      {/* Knowledge Base Pane Button */}
      {showKB &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <div>
              <CollectionsButton session={session} />
              <span className="sr-only">Explore Ai knowledge base</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Knowledge Base</TooltipContent>
        </Tooltip>
      }
    </div>
  )
}
