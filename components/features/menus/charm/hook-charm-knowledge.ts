import { I_Collection, T_Memory_Type } from '@/lib/homebrew'
import { useState } from 'react'

export const DEFAULT_TYPE = 'training'

export const useKnowledgeMenu = () => {
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Settings states
  const [type, setType] = useState<T_Memory_Type>(DEFAULT_TYPE)
  const [selected, setSelected] = useState<string[]>([]) // Tracks all checkbox states
  // Data states
  const [collections, setCollections] = useState<I_Collection[]>([])

  return {
    collections,
    setCollections,
    disableForm,
    setDisableForm,
    type,
    setType,
    selected,
    setSelected,
  }
}
