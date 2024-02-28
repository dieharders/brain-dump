import { I_Collection, T_Memory_Type } from '@/lib/homebrew'
import { Dispatch, SetStateAction, useRef, useState } from 'react'

export const DEFAULT_TYPE = 'training'

export const useKnowledgeMenu = () => {
  const checkboxes = useRef<string[]>([]) // Tracks all checkbox states
  const [collections, setCollections] = useState<I_Collection[]>([])
  const checkboxCallbacks = useRef<{ [key: string]: Dispatch<SetStateAction<boolean>> }>(
    {},
  ) // Func to check/uncheck
  const [disableForm, setDisableForm] = useState(false)
  const [type, setType] = useState<T_Memory_Type>(DEFAULT_TYPE)
  const [selected, setSelected] = useState<string[]>([])

  return {
    checkboxes,
    collections,
    setCollections,
    checkboxCallbacks,
    disableForm,
    setDisableForm,
    type,
    setType,
    selected,
    setSelected,
  }
}
