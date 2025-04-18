'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { I_Knowledge_State } from '@/lib/homebrew'
import { Separator } from '@/components/ui/separator'
import { T_CharmId } from '@/components/features/menus/charm/menu-chat-charms'
import { KnowledgeTab, defaultState } from '@/components/features/menus/tabs/tab-knowledge'
import { useGlobalContext } from '@/contexts'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (settings: I_Knowledge_State) => void
}

export const charmId: T_CharmId = 'memory'

// A menu to select from a list of collections
export const KnowledgeCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit } = props
  const { playgroundSettings } = useGlobalContext()
  const [state, setState] = useState<I_Knowledge_State>(
    playgroundSettings.memory || defaultState,
  )
  const knowledgeMenu = useMemo(() => <KnowledgeTab state={state} onSelect={setState} />, [state])

  // Reset when opening again
  useEffect(() => {
    if (!dialogOpen) setState(playgroundSettings.memory || defaultState)
  }, [dialogOpen, playgroundSettings.memory])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        {knowledgeMenu}

        <Separator className="my-4" />

        {/* Buttons */}
        <DialogFooter className="items-center">
          <Button
            variant="ghost"
            className="w-full sm:w-32"
            onClick={() => {
              // Reset state
              setDialogOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-32"
            onClick={async () => {
              // Save the list based on currently selected checkboxes
              onSubmit(state)
              setDialogOpen(false)
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
