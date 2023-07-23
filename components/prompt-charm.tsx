import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconPlus,
  IconUser,
  IconBrain,
  IconMicrophone,
  IconPromptTemplate,
  IconConversationType,
} from '@/components/ui/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface I_CharmItemProps {
  children: React.ReactNode
  action?: () => void
}

export const CharmMenu = () => {
  const classnameIcon = 'h-16 w-16'
  const renderButton = (
    <Button
      className={cn(
        buttonVariants({ size: 'sm', variant: 'outline' }),
        'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4',
      )}
    >
      <IconPlus className="text-foreground" />
      <span className="sr-only">Prompt Options Menu</span>
    </Button>
  )
  const CharmItem = (props: I_CharmItemProps) => {
    return (
      <DropdownMenuItem className="h-8 w-8 p-1" onClick={props?.action}>
        {props.children}
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{renderButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        sideOffset={8}
        align="center"
        onCloseAutoFocus={event => {
          event.preventDefault()
        }}
      >
        {/* Target Brain -  which knowledge bases to use as context */}
        <CharmItem>
          <IconBrain className={classnameIcon} />
        </CharmItem>
        <DropdownMenuSeparator />
        {/* Conversation Type - Q+A, Conversational, Inquisitive, Assistant, Agent? */}
        <CharmItem>
          <IconConversationType className={classnameIcon} />
        </CharmItem>
        <DropdownMenuSeparator />
        {/* Prompt Template - You are an expert researcher/coder/generalist/etc. Includes presets as well as a custom form to write your own */}
        <CharmItem>
          <IconPromptTemplate className={classnameIcon} />
        </CharmItem>
        <DropdownMenuSeparator />
        {/* Agent Presets - creative, precise, normal */}
        <CharmItem>
          <IconUser className={classnameIcon} />
        </CharmItem>
        <DropdownMenuSeparator />
        {/* Microphone - use to input text */}
        <CharmItem>
          <IconMicrophone className={classnameIcon} />
        </CharmItem>
        {/* Should we add a shortcut for setting the model to use for this prompt? */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
