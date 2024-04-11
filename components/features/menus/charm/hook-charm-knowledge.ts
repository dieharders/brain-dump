import { useState } from 'react'
import { T_Memory_Type } from '@/lib/homebrew'

export const DEFAULT_TYPE = 'training'

export const useKnowledgeMenu = () => {
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Settings states
  const [type, setType] = useState<T_Memory_Type>(DEFAULT_TYPE)
  const [selected, setSelected] = useState<string[]>([]) // Tracks all checkbox states

  return {
    disableForm,
    setDisableForm,
    type,
    setType,
    selected,
    setSelected,
  }
}
