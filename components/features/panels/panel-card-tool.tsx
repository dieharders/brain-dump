'use client'

import { I_PanelCardProps } from '@/components/features/panels/panel-card'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface I_Props extends I_PanelCardProps {
  name: string
  description?: string
  icon?: string
  path?: string
  className?: string
}

/**
 * A card container for tool.
 */
export const ToolPanelCard = ({ name = 'No name', description = 'No description.', path = '', icon, className }: I_Props) => {
  const isCloudFuncPath = path?.includes('https://') || path?.includes('http://')
  const pathIcon = isCloudFuncPath ? '🌐' : '💻'
  const toolTipStyle = cn('w-full overflow-hidden')
  const labelStyle = cn('justify-left flex')

  const data = {
    name,
    type: 'Tool',
    description,
    icon: '🔧',
    stats: [
      {
        name: 'Tool location',
        value: path,
        icon: pathIcon
      }
    ]
  }

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
    {/* Stats */}
    {data.stats &&
      <div className="flex h-fit w-full flex-row justify-start justify-items-stretch gap-4 space-x-2 overflow-hidden text-ellipsis whitespace-nowrap text-gray-400">
        {data.stats?.map(stat => {
          return (
            // This div correctly aligns tool popup
            <div className="w-fit overflow-hidden text-ellipsis whitespace-nowrap" key={stat.name} >
              <Tooltip delayDuration={350}>
                <TooltipTrigger
                  tabIndex={-1}
                  className={toolTipStyle}
                >
                  <div className={labelStyle}>
                    <p className="truncate">{stat?.icon || '❔'}{' '}{stat?.value}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{stat?.name}: {stat?.value}</TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    }
  </>
}
