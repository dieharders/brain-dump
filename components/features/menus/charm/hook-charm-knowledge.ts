import { useState } from 'react'
import { DEFAULT_ACTIVE_ROLE, T_ActiveRoles } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'

export const useKnowledgeMenu = () => {
  const { playgroundSettings } = useGlobalContext()
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Settings states
  const [type, setType] = useState<T_ActiveRoles>(
    playgroundSettings.attention.active_role || DEFAULT_ACTIVE_ROLE,
  )
  // Tracks all checkbox states
  const [selected, setSelected] = useState<string[]>(
    playgroundSettings.knowledge.index || [],
  )

  return {
    disableForm,
    setDisableForm,
    type,
    setType,
    selected,
    setSelected,
  }
}
