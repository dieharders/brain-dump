'use client'
import { Session } from 'next-auth'
import { IconArrowElbow, IconRefresh } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChatsButton } from '@/components/features/panels/chats-panel-button'
import { CollectionsButton } from '@/components/features/panels/collections-panel-button'
import { usePathname, useRouter } from 'next/navigation'
import { ROUTE_CHATBOT, ROUTE_PLAYGROUND } from '@/app/constants'

export const MenuPanelTriggers = ({ session }: { session: Session }) => {
  const pathname = usePathname()
  const router = useRouter()
  const routeId = pathname.split('/')[1] // base url
  const header_url = routeId || 'home'
  const showKB = header_url === 'knowledge'
  const showChatThreads = header_url === ROUTE_CHATBOT || header_url === ROUTE_PLAYGROUND
  const showHomeShortcut = showChatThreads || showKB
  const showHostConnPage = header_url !== 'connect'

  return (
    <div className="flex items-center">
      {/* Home page shortcut */}
      {showHomeShortcut &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="mx-1 h-9 w-9 p-0"
              onClick={() => router.replace('/')}
            >
              <IconArrowElbow className="h-6 w-6" />
              <span className="sr-only">Go back to main menu</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Home</TooltipContent>
        </Tooltip>
      }

      {/* Host connection page shortcut */}
      {showHostConnPage &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="mx-1 h-9 w-9 p-0"
              onClick={() => {
                router.push('connect')
              }}
            >
              <IconRefresh className="h-6 w-6" />
              <span className="sr-only">Go to connection menu</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Server connection</TooltipContent>
        </Tooltip>
      }

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
