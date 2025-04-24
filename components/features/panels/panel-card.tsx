'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type T_Stat = {
  icon?: string
  value: number | string
  name: string
}

interface I_Data {
  name: string
  type: string
  description?: string
  icon?: string
  stats?: T_Stat[]
}

export interface I_PanelCardProps {
  isActive?: boolean // when hovered or clicked
  isSelected?: boolean // when selected in a checkbox
  onClick?: () => void
  children?: React.ReactNode // for buttons
  className?: string
}

interface I_Props extends I_PanelCardProps {
  data: I_Data
}

/**
 * A card container for some data that resides in a panel.
 */
export const PanelCard = (props: I_Props) => {
  const { data, onClick, isSelected, isActive: isHighlighted, className, children } = props
  const [isActive, setIsActive] = useState(false)
  const description = data?.description || 'No description.'
  const name = data?.name || 'No title'
  const toolTipStyle = cn('w-full overflow-hidden')
  const labelStyle = cn('justify-left flex')
  const stats = data.stats || []

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
        {data?.icon && <div className="h-100 flex cursor-pointer items-center justify-center">
          <Tooltip delayDuration={350}>
            <TooltipTrigger
              tabIndex={-1}
              className="focus:bg-muted focus:ring-1 focus:ring-ring"
            >
              <div className="mr-2">{data?.icon}</div>
            </TooltipTrigger>
            <TooltipContent>{data?.type}</TooltipContent>
          </Tooltip>
        </div>}

        {/* Card name */}
        <span className="h-100 my-auto w-full truncate">
          {name}
        </span>

        {/* Render action buttons when clicked and active */}
        <span className="flex h-8 w-fit items-center">
          {isHighlighted && children}
        </span>
      </div>

      {/* Description */}
      <div className="flex h-fit w-full overflow-hidden text-left text-slate-500">
        <span className="whitespace-wrap line-clamp-3 w-full overflow-hidden text-ellipsis">
          {description}
        </span>
      </div>

      {/* Stats */}
      {data.stats &&
        <div className="flex h-fit w-full flex-row justify-evenly justify-items-stretch gap-4 space-x-2 overflow-hidden text-ellipsis whitespace-nowrap text-gray-400">
          {stats?.map(stat => {
            return (
              // This div correctly aligns tool popup
              <div className="w-fit overflow-hidden text-ellipsis whitespace-nowrap" key={stat.name} >
                <Tooltip delayDuration={350}>
                  <TooltipTrigger
                    tabIndex={-1}
                    className={toolTipStyle}
                  >
                    <div className={labelStyle}>
                      <p className="truncate">{stat?.icon || '⭕'}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{stat?.name}: {stat?.value}</TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}
