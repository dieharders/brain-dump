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
import { AddToolTab } from '@/components/features/menus/tabs/tab-add-tool'
import { toast } from 'react-hot-toast'

interface I_Props {
  dialogOpen: { open: boolean, initialState?: I_Tool_Definition }
  setDialogOpen: (isOpen: boolean) => void
  onSubmit: (saveSettings: I_Tool_Definition) => Promise<void>
}

export const ToolCreationMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit } = props

  // State values
  const [state, setState] = useState<I_Tool_Definition>({} as I_Tool_Definition)
  const [isDisabled, setDisabled] = useState(false)

  // Hooks
  const onSaveClick = useCallback(
    () => {
      const paramsValid = state.params?.every(p => {
        if (p.input_type && !p.value) {
          toast.error(`Please enter a value for parameter "${p.name}".`)
          return false
        }
        return true
      })
      // Check params valid
      if (!paramsValid) return
      // Check required params
      if (!state.params) {
        toast.error('Tool parameters are empty or missing.')
        return
      }
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
        await onSubmit(state)
        // Close menu
        setDisabled(false)
        setDialogOpen(false)
      }
      action()
    },
    [onSubmit, setDialogOpen, state],
  )

  // Assign prev saved state (if exists)
  useEffect(() => {
    if (dialogOpen?.initialState) setState(dialogOpen.initialState)
  }, [dialogOpen.initialState])

  // Reset state on menu close
  useEffect(() => {
    if (!dialogOpen.open) setState({} as any)
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen.open} onOpenChange={setDialogOpen}>
      <DialogContent className="lg:min-w-[35%]">
        <DialogHeader>
          <DialogTitle className="text-xl">{dialogOpen.initialState ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
        </DialogHeader>

        <AddToolTab savedState={dialogOpen.initialState} state={state} setState={setState} />

        <Separator className="my-6" />

        <DialogFooter className="content-center items-stretch">
          <Button onClick={onSaveClick} disabled={isDisabled}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
