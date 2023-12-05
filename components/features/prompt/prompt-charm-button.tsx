import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { MouseEvent } from 'react'

interface I_Props {
  onClick: (event: MouseEvent) => void
}

export const CharmMenuButton = ({ onClick }: I_Props) => {
  return (
    <Tooltip delayDuration={350}>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4',
        )}
      >
        <IconPlus className="text-foreground" />
        <span className="sr-only">Prompt Options Menu Button</span>
      </TooltipTrigger>
      <TooltipContent>Prompt Options</TooltipContent>
    </Tooltip>
  )
}
