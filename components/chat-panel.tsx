import { useState } from 'react'
import { type UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { CharmMenu, I_Charm, T_CharmId } from '@/components/features/prompt/prompt-charm-menu'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    'append' | 'isLoading' | 'reload' | 'messages' | 'stop' | 'input' | 'setInput'
  > {
  id?: string
  theme: string | undefined
}

export function ChatPanel({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  theme,
}: ChatPanelProps) {
  // @TODO from-neutral-900 does not match the chat-page's bg color
  const colorFrom = theme === 'light' ? 'from-muted/100' : 'from-neutral-900'
  const colorTo = theme === 'light' ? 'to-muted/0' : 'to-muted/150'
  const [charmMenuOpen, setCharmMenuOpen] = useState(false)
  const [activeCharms, setActiveCharms] = useState<I_Charm[]>([])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 bg-gradient-to-t ${colorFrom} from-85% ${colorTo} to-100%`}
    >
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {isLoading ? (
            <Button variant="outline" onClick={() => stop()} className="bg-background">
              <IconStop className="mr-2" />
              Stop generating
            </Button>
          ) : (
            messages?.length > 0 && (
              <Button
                variant="outline"
                onClick={() => reload()}
                className="bg-background"
              >
                <IconRefresh className="mr-2" />
                Regenerate response
              </Button>
            )
          )}
        </div>
        {/* Main Prompt Panel */}
        <div className="flex flex-col content-start space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <CharmMenu
            open={charmMenuOpen}
            activeCharms={activeCharms}
            setActiveCharms={(selectedCharm: I_Charm) => {
              const charmIds = activeCharms.map(i => i.id)
              const exists = charmIds.includes(selectedCharm.id)
              // Check we arent adding dupes
              if (exists) {
                const index = charmIds.indexOf(selectedCharm.id)
                const newActiveCharms = [...activeCharms]
                newActiveCharms.splice(index, 1)
                setActiveCharms([...newActiveCharms, selectedCharm])
              }
              else setActiveCharms([...activeCharms, selectedCharm])
            }}
            removeCharm={(id: T_CharmId) => {
              const ind = activeCharms.findIndex(i => i.id === id)
              if (ind === -1) return
              const newList = [...activeCharms]
              newList.splice(ind, 1)
              setActiveCharms(newList)
            }} />

          <PromptForm
            onSubmit={async value => {
              // Call all charm.onPromptCallback in the list before sending the prompt
              let newContent = value
              activeCharms.forEach(charm => {
                if (charm?.onPromptCallback) {
                  newContent = charm.onPromptCallback(newContent)
                }
              })
              // Send prompt
              await append({
                id,
                content: newContent,
                role: 'user',
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onCharmClick={() => setCharmMenuOpen(!charmMenuOpen)}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
