import { useMemo, useState } from 'react'
import { type UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { ChatPrompt } from '@/components/features/chat/chat-prompt'
import { ButtonScrollToBottom } from '@/components/features/chat/button-scroll-to-bottom'
import { CharmMenu, T_CharmId } from '@/components/features/menus/charm/menu-chat-charms'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/features/layout/footer'
import { ROUTE_CHATBOT, ROUTE_PLAYGROUND } from '@/app/constants'
import { useGlobalContext } from '@/contexts'
import { RainbowBorderCone } from '@/components/features/effects/rainbow-border'
import { formatDate, nanoid } from '@/lib/utils'
import { I_Message } from '@/lib/homebrew'
import { Session } from 'next-auth/types'

type TAppend = (message: I_Message) => Promise<void>

export interface I_Props
  extends Pick<
    UseChatHelpers,
    'isLoading' | 'reload' | 'stop'
  > {
  routeId?: string
  theme: string | undefined
  append: TAppend
  session: Session
  messages: I_Message[]
}

export const ChatPromptMenu = ({
  routeId,
  stop,
  append,
  reload,
  messages,
  session,
  theme,
}: I_Props) => {
  const { isAiThinking, currentThreadId } = useGlobalContext()
  const colorFrom = theme === 'light' ? 'from-neutral-200' : 'from-neutral-900'
  const colorTo = theme === 'light' ? 'to-neutral-200/0' : 'to-neutral-900/0'
  const [charmMenuOpen, setCharmMenuOpen] = useState(false)
  const [activeCharms, setActiveCharms] = useState<T_CharmId[]>([])
  const charmsList = useMemo((): T_CharmId[] => {
    switch (routeId) {
      case ROUTE_PLAYGROUND:
        return ['microphone', 'speak', 'memory', 'prompt']
      case ROUTE_CHATBOT:
        return ['microphone', 'speak']
      default:
        return []
    }
  }, [routeId])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 bg-gradient-to-t ${colorFrom} from-85% ${colorTo} to-100%`}
    >
      {currentThreadId.current && <ButtonScrollToBottom />}
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-14 items-center justify-center">
          {isAiThinking ? (
            <Button variant="outline" onClick={() => stop()} className="bg-background">
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={reload}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        {/* Prompt Panel container */}
        <div className="flex flex-col justify-between space-y-4 border-t bg-background px-0 py-2 shadow-lg sm:rounded-t-xl sm:border sm:px-4 md:py-4">
          <CharmMenu
            open={charmMenuOpen}
            charmsList={charmsList}
            activeCharms={activeCharms}
            toggleActiveCharm={(selectedCharmId: T_CharmId) => {
              const index = activeCharms.indexOf(selectedCharmId)
              const exists = index !== -1
              // Remove
              if (exists) {
                const newActiveCharms = [...activeCharms]
                newActiveCharms.splice(index, 1)
                setActiveCharms(newActiveCharms)
              }
              // Add
              else setActiveCharms([...activeCharms, selectedCharmId])
            }}
          />
          {/* Prompt */}
          <RainbowBorderCone disabled={!isAiThinking}>
            <ChatPrompt
              onCharmClick={() => setCharmMenuOpen(!charmMenuOpen)}
              charmMenuIsOpen={charmMenuOpen}
              onSubmit={async value => {
                // Send prompt
                await append({
                  id: nanoid(),
                  content: value,
                  role: 'user',
                  createdAt: formatDate(new Date()),
                  username: session?.user?.name || '',
                })
              }}
            />
          </RainbowBorderCone>
          {/* Footer */}
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
