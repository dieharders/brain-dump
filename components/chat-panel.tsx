import { Dispatch, SetStateAction, useState } from 'react'
import { CreateMessage, Message, type UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { CharmMenu, I_Charm, T_CharmId } from '@/components/features/prompt/prompt-charm-menu'
import { IconRefresh, IconStop } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'
import { I_Text_Settings } from '@/lib/homebrew'

type TAppend = (message: Message | CreateMessage) => Promise<string | null | undefined>

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    'isLoading' | 'reload' | 'messages' | 'stop' | 'input' | 'setInput'
  > {
  id?: string
  theme: string | undefined
  append: TAppend
  settings?: I_Text_Settings,
  setSettings?: Dispatch<SetStateAction<I_Text_Settings>>,
}

export const ChatPanel = ({
  id,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  theme,
  settings,
  setSettings,
}: ChatPanelProps) => {
  const colorFrom = theme === 'light' ? 'from-neutral-200' : 'from-neutral-900'
  const colorTo = theme === 'light' ? 'to-neutral-200/0' : 'to-neutral-900/0'
  const [charmMenuOpen, setCharmMenuOpen] = useState(false)
  const [activeCharms, setActiveCharms] = useState<I_Charm[]>([])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 bg-gradient-to-t ${colorFrom} from-85% ${colorTo} to-100%`}
    >
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-14 items-center justify-center">
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
        <div className="flex flex-col justify-between space-y-4 border-t bg-background px-0 py-2 shadow-lg sm:rounded-t-xl sm:border sm:px-4 md:py-4">
          <CharmMenu
            open={charmMenuOpen}
            settings={settings}
            setSettings={setSettings}
            activeCharms={activeCharms}
            addActiveCharm={(selectedCharm: I_Charm) => {
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
            removeActiveCharm={(id: T_CharmId) => {
              const ind = activeCharms.findIndex(i => i.id === id)
              if (ind === -1) return
              const newList = [...activeCharms]
              newList.splice(ind, 1)
              setActiveCharms(newList)
            }} />

          <PromptForm
            onCharmClick={() => setCharmMenuOpen(!charmMenuOpen)}
            charmMenuIsOpen={charmMenuOpen}
            onSubmit={async value => {
              // Send prompt
              await append({
                id,
                content: value,
                role: 'user',
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
