'use client'

import { I_PanelCardProps, PanelCard } from '@/components/features/panels/panel-card'
import { I_Source } from '@/lib/homebrew'

interface I_Props extends I_PanelCardProps {
  document: I_Source
  numChunks: number
}

/**
 * A card container for document.
 */
export const DocumentCard = (props: I_Props) => {
  const { document, numChunks, onClick, isSelected, isActive, className, children } = props
  const numTags = document?.tags ? document?.tags?.split(' ').length : 0
  const description = document?.description || 'No description.'
  const name = document?.document_name || 'No title'
  const createdAt = document?.created_at || '?'
  const documentType = document?.file_type || '?'
  const data = {
    name: name,
    type: 'Source Document',
    description: description || 'No description.',
    icon: '📄',
    stats: [
      {
        name: 'Chunks',
        value: numChunks,
        icon: '🍪'
      },
      {
        name: 'Document type',
        value: documentType,
        icon: '💾'
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
