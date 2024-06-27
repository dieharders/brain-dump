import { useState } from 'react'
import { useGlobalContext } from '@/contexts'

export const useToolsMenu = () => {
  const { playgroundSettings } = useGlobalContext()
  // Menu states
  const [disableForm, setDisableForm] = useState(false)
  // Tracks all checkbox states
  const [selected, setSelected] = useState<string[]>(
    playgroundSettings.tools?.assigned || [],
  )

  return {
    disableForm,
    setDisableForm,
    selected,
    setSelected,
  }
}
