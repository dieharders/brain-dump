'use client'
import { useCallback, useEffect } from 'react'
import { Session } from 'next-auth'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CollectionsButton } from '@/components/features/panels/collections-panel-button'
import { ChatsButton } from '@/components/features/panels/chats-panel-button'
import { DocumentsButton } from '@/components/features/panels/documents-panel-button'
import { ROUTE_CHATBOT, ROUTE_KNOWLEDGE, ROUTE_PLAYGROUND } from '@/app/constants'
import { IconArrowElbow } from '@/components/ui/icons'
import { CubeIcon } from '@radix-ui/react-icons'
import { useHomebrew } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemoryActions } from '@/components/features/crud/actions'

export const MenuPanelTriggers = ({ session }: { session: Session }) => {
  const { getServices } = useHomebrew()
  const { services, setServices, setCollections, setDocuments } = useGlobalContext()
  const { fetchDocuments, fetchCollections } = useMemoryActions()
  const pathname = usePathname()
  const search = useSearchParams()
  const router = useRouter()
  const selectedCollectionName = search.get('collectionName')
  const routeId = pathname.split('/')[1] // base url
  const header_url = routeId || '/'
  const showKB = header_url === ROUTE_KNOWLEDGE
  const showChatThreads = header_url === ROUTE_CHATBOT || header_url === ROUTE_PLAYGROUND
  const showHomeShortcut = showChatThreads || showKB
  const showHostConnPage = header_url === 'home'

  const fetchDocumentsAction = useCallback(async () => {
    // Need to re-fetch all collections before getting documents
    const collRes = await fetchCollections()
    collRes && setCollections(collRes)
    // Update documents data
    const res = await fetchDocuments(selectedCollectionName)
    res?.length > 0 && setDocuments(res)
    return
  }, [fetchCollections, fetchDocuments, selectedCollectionName, setCollections, setDocuments])

  useEffect(() => {
    const action = async () => {
      const s = await getServices()
      s && setServices(s)
    }
    if (!services) action()
  }, [getServices, services, setServices])

  return (
    <div className="flex items-center">
      {/* Home page shortcut */}
      {showHomeShortcut &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="mx-1 h-9 w-9 p-0"
              onClick={() => router.replace('home')}
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
                router.replace('/')
              }}
            >
              <CubeIcon className="h-6 w-6" />
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

      {/* Documents - Open Pane Button */}
      {showKB &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <div>
              <DocumentsButton
                session={session}
                collectionName={selectedCollectionName}
                fetchAction={fetchDocumentsAction}
              />
              <span className="sr-only">List of knowledge base documents</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Documents</TooltipContent>
        </Tooltip>
      }

      {/* Collections - Open Pane Button */}
      {showKB &&
        <Tooltip delayDuration={450}>
          <TooltipTrigger asChild>
            <div>
              <CollectionsButton session={session} />
              <span className="sr-only">List of knowledge base collections</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Collections</TooltipContent>
        </Tooltip>
      }
    </div>
  )
}
