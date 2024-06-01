import { useState } from 'react'
import { T_Memory_Type } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'

export const DEFAULT_TYPE = 'training'

export const useKnowledgeMenu = () => {
  const { playgroundSettings } = useGlobalContext()
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Settings states
  const [type, setType] = useState<T_Memory_Type>(
    playgroundSettings.knowledge.type || DEFAULT_TYPE,
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
