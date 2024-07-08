'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { I_Tool_Definition } from '@/lib/homebrew'
import { AddToolTab, defaultState } from '@/components/features/menus/tabs/tab-add-tool'
import { toast } from 'react-hot-toast'

interface I_Props {
  dialogOpen: { open: boolean, initialState?: I_Tool_Definition }
  setDialogOpen: (isOpen: boolean) => void
  onSubmit: (saveSettings: I_Tool_Definition) => Promise<void>
}

export const ToolCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit } = props

  // State values
  const [state, setState] = useState<I_Tool_Definition>(defaultState)
  const [isDisabled, setDisabled] = useState(false)

  // Hooks
  const onSaveClick = useCallback(
    () => {
      // Check form validation
      if (!state.name) {
        toast.error('Please enter a name for this tool.')
        return
      }
      if (!state.path) {
        toast.error('Please enter the path to the code for this tool to execute.')
        return
      }
      // Save settings
      setDisabled(true)
      const action = async () => {
        // Convert args to objects
        const parsedRes = { ...state, arguments: {}, example_arguments: {} }
        await onSubmit(parsedRes)
        // Close
        setDisabled(false)
        setDialogOpen(false)
      }
      action()
    },
    [onSubmit, setDialogOpen, state],
  )

  // Load/Reload settings data
  useEffect(() => {
    if (dialogOpen.open) setState({ ...defaultState, ...dialogOpen?.initialState })
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen.open} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:min-w-[35%]">
        <DialogHeader>
          <DialogTitle className="text-xl">{state.id ? 'Edit tool' : 'Add custom tool'}</DialogTitle>
        </DialogHeader>

        <AddToolTab state={state} setState={setState} />

        <Separator className="my-6" />

        <DialogFooter className="content-center items-stretch">
          <Button onClick={onSaveClick} disabled={isDisabled}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
