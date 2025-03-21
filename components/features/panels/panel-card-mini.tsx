'use client'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface I_MiniPanelCardProps {
  name: string
  description?: string
  icon?: string
  className?: string
}

/**
 * A card container for some data that resides in a panel.
 */
export const MiniPanelCard = ({ name = 'No title', description = 'No description.', icon, className }: I_MiniPanelCardProps) => {
  return <>
    {/* Header */}
    <div className={cn('flex w-full items-stretch overflow-hidden', className)}>
      {/* Icon */}
      {icon && <div className="h-100 flex cursor-pointer items-center justify-center">
        <Tooltip delayDuration={350}>
          <TooltipTrigger
            tabIndex={-1}
            className="focus:bg-muted focus:ring-1 focus:ring-ring"
          >
            <div className="mr-2">{icon}</div>
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      </div>}
      {/* Card name */}
      <span className="h-100 my-auto w-full truncate">
        {name}
      </span>
    </div>
    {/* Description */}
    <div className="flex h-fit w-full overflow-hidden text-left text-slate-500">
      <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
        {description}
      </span>
    </div>
  </>
}
