import { MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface I_Props {
  onClick: (event: MouseEvent) => void
  open: boolean
}

export const CharmMenuButton = ({ open, onClick }: I_Props) => {
  const animStyle = open ? 'animate-pulse' : ''
  const focusStyle = open ? 'shadow-[0_0_0.75rem_0.25rem_rgba(99,102,241,0.9)] outline-none ring-2 ring-purple-300' : ''
  const rotateStyle = open ? 'rotate-45' : 'rotate-0'

  return (
    <Tooltip delayDuration={350}>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          `absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 transition ease-in-out sm:left-4 ${focusStyle} ${animStyle} ${rotateStyle}`,
        )}
      >
        <IconPlus className="text-foreground" />
        <span className="sr-only">Prompt Options Menu Button</span>
      </TooltipTrigger>
      <TooltipContent>Prompt Options</TooltipContent>
    </Tooltip>
  )
}
