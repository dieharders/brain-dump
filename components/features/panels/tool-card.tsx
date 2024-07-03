'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { I_Tool_Definition } from '@/lib/homebrew'

interface SidebarItemProps {
  item: I_Tool_Definition
  isActive?: boolean // when hovered or clicked
  isSelected?: boolean // when selected in a checkbox
  onClick?: () => void
  children?: React.ReactNode
  className?: string
}

/**
 * A card container for tool.
 * @TODO combine with document-card
 */
export const ToolCard = (props: SidebarItemProps) => {
  const { item, onClick, isSelected, isActive: isHighlighted, className, children } = props
  const [isActive, setIsActive] = useState(false)
  const icon = '🔧'
  const toolTipStyle = cn("w-full overflow-hidden")
  const labelStyle = cn("justify-left flex")
  const numArgs = item.arguments?.length

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'hover-bg-accent relative flex h-fit min-h-[9rem] w-full select-none flex-col space-y-4 overflow-hidden py-4 text-left sm:w-[20rem]',
        className,
        (isActive || isHighlighted) && 'bg-accent',
        isSelected && 'bg-accent',
        onClick && 'cursor-pointer',
      )}
      onClick={e => {
        e.preventDefault()
        onClick && onClick()
      }}
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
    >
      {/* Header */}
      <div className="flex w-full items-stretch overflow-hidden">
        {/* Icon */}
        <div className="h-100 flex cursor-pointer items-center justify-center">
          <Tooltip delayDuration={350}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <div className="mr-2 text-xl">{icon}</div>
            </TooltipTrigger>
            <TooltipContent>Tool</TooltipContent>
          </Tooltip>
        </div>

        {/* Card name */}
        <span className="h-100 my-auto w-full truncate text-xl">
          {item.name}
        </span>

        {/* Render action buttons when clicked and active */}
        <span className="flex h-8 w-fit items-center">
          {isHighlighted && children}
        </span>
      </div>

      {/* Description */}
      <div className="flex h-fit w-full overflow-hidden text-left text-slate-500">
        <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
          {item?.description || 'No description.'}
        </span>
      </div>

      {/* Path to code */}
      {item?.path && <div className="flex h-fit w-full flex-row items-stretch justify-start justify-items-stretch gap-4 overflow-hidden text-left text-slate-500">
        <span className="line-clamp-1 block w-fit overflow-hidden text-ellipsis whitespace-nowrap">
          🌐{item?.path}
        </span>
        {/* Stats */}
        <div className="flex h-fit w-fit flex-row justify-between justify-items-stretch space-x-2 overflow-hidden text-gray-400">
          {/* Number of metadata tags */}
          <Tooltip delayDuration={350}>
            <TooltipTrigger
              tabIndex={-1}
              className={toolTipStyle}
            >
              <div className={labelStyle}>
                <p className="truncate">❔ {numArgs}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>Argument count: {numArgs}</TooltipContent>
          </Tooltip>
        </div>
      </div>}

    </div>
  )
}
