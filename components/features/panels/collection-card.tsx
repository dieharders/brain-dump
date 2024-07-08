'use client'

import { I_PanelCardProps, PanelCard } from '@/components/features/panels/panel-card'
import { I_Collection } from '@/lib/homebrew'

interface I_Props extends I_PanelCardProps {
  collection: I_Collection
}

/**
 * A card container for collection of documents.
 */
export const CollectionCard = (props: I_Props) => {
  const { collection, onClick, isSelected, isActive, className, children } = props
  const numFavorites = collection?.metadata?.favorites || 0
  const numTags = collection?.metadata?.tags ? collection?.metadata?.tags?.split(' ').length : 0
  const numSources = collection?.metadata?.sources.length || 0
  const createdAt = collection?.metadata?.createdAt || '?'
  const icon = collection?.metadata?.icon || '🧠'
  const data = {
    name: collection.name || 'No name',
    type: 'Collection',
    description: collection.metadata?.description || 'No description.',
    icon: icon,
    stats: [
      {
        name: 'Source count',
        value: numSources,
        icon: '📂'
      },
      {
        name: 'Favorite count',
        value: numFavorites,
        icon: '⭐'
      },
      {
        name: 'Tag count',
        value: numTags,
        icon: '🔖'
      },
      {
        name: 'Created',
        value: createdAt,
        icon: '📆'
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
