import { useState } from 'react'
import { DEFAULT_RETRIEVAL_METHOD, T_RetrievalTypes } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'

export const useKnowledgeMenu = () => {
  const { playgroundSettings } = useGlobalContext()
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Settings states
  const [type, setType] = useState<T_RetrievalTypes>(
    playgroundSettings.attention.retrievalMethod || DEFAULT_RETRIEVAL_METHOD,
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
