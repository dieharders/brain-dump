'use client'

import { I_PanelCardProps, PanelCard } from '@/components/features/panels/panel-card'
import { I_Tool_Definition } from '@/lib/homebrew'

interface I_Props extends I_PanelCardProps {
  item: I_Tool_Definition
}

/**
 * A card container for tool.
 */
export const ToolCard = (props: I_Props) => {
  const { item, onClick, isSelected, isActive, className, children } = props
  const toolPath = item.path
  const isCloudFuncPath = toolPath?.includes('https://') || toolPath?.includes('http://')
  const pathIcon = isCloudFuncPath ? '🌐' : '💻'
  const data = {
    name: item.name || 'No name',
    type: 'Tool',
    description: item?.description || 'No description.',
    icon: '🔧',
    stats: [
      {
        name: 'Tool location',
        value: toolPath || '',
        icon: pathIcon
      }
    ]
  }

  return (
    <PanelCard
      onClick={onClick}
      isSelected={isSelected}
      isActive={isActive}
      data={data}
      className={className}
    >
      {children}
    </PanelCard>
  )
}
