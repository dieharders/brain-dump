import { useEffect, useRef, MouseEvent } from 'react'
import Textarea from 'react-textarea-autosize'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { IconArrowElbow } from '@/components/ui/icons'
import { CharmMenuButton } from '@/components/features/chat/button-charm-menu-trigger'
import { useChatContext, useGlobalContext } from '@/contexts'
import { cn } from '@/lib/utils'

interface I_Props {
  onSubmit: (value: string) => Promise<void>
  onCharmClick: () => void
  charmMenuIsOpen: boolean
}

export const ChatPrompt = ({ onSubmit, onCharmClick, charmMenuIsOpen }: I_Props) => {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { isAiThinking, eventState, } = useGlobalContext()
  const { promptInput, setPromptInput } = useChatContext()
  const isDisabledPointerStyle = isAiThinking ? 'cursor-not-allowed' : ''

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!promptInput?.trim()) {
          return
        }
        setPromptInput('')
        await onSubmit(promptInput)
      }}
      ref={formRef}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-12 sm:rounded-md sm:border">
        {/* Button to open charms selection menu */}
        <CharmMenuButton
          open={charmMenuIsOpen}
          onClick={(e: MouseEvent) => {
            e.preventDefault()
            onCharmClick()
          }} />
        {/* Text prompt area */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={promptInput}
          onChange={e => setPromptInput(e.target.value)}
          placeholder={isAiThinking ? eventState : 'Ask a question...'}
          spellCheck={false}
          className={cn(`scrollbar min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm ${isDisabledPointerStyle}`)}
          disabled={isAiThinking}
        />
        {/* Submit button */}
        <div className={cn(`absolute right-4 top-4 ${isDisabledPointerStyle}`)}>
          <Tooltip delayDuration={250}>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={isAiThinking || promptInput === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
