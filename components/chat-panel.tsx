import { useState } from 'react'
import { type UseChatHelpers } from 'ai/react'
import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { CharmMenu } from '@/components/features/prompt/prompt-charm-menu'
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

  return (
    <div
      // eslint-disable-next-line tailwindcss/classnames-order
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
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <CharmMenu open={charmMenuOpen} />

          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value,
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
