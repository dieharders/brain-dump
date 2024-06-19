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
import { I_Tools_Settings } from '@/lib/homebrew'
import { AddToolTab, defaultState } from '@/components/features/menus/tabs/tab-add-tool'
import { toast } from 'react-hot-toast'

export type I_Submit_Tool_Settings = Omit<I_Tools_Settings, 'id'>

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (saveSettings: I_Submit_Tool_Settings) => Promise<void>
}

export const ToolCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit } = props

  // State values
  const defaults = defaultState
  const [state, setState] = useState<I_Submit_Tool_Settings>(defaults)
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
        await onSubmit(state)
        // Close
        setDisabled(false)
        setDialogOpen(false)
      }
      action()
    },
    [onSubmit, setDialogOpen, state],
  )

  useEffect(() => {
    // Reset settings
    if (dialogOpen) setState(defaults)
  }, [defaults, dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:min-w-[35%]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add tool</DialogTitle>
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
