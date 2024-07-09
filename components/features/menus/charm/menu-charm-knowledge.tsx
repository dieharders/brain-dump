'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { I_Collection, I_Knowledge_State } from '@/lib/homebrew'
import { Separator } from '@/components/ui/separator'
import { T_CharmId } from '@/components/features/menus/charm/menu-chat-charms'
import { KnowledgeTab } from '@/components/features/menus/tabs/tab-knowledge'
import { useKnowledgeMenu } from '@/components/features/menus/charm/hook-charm-knowledge'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  fetchListAction: () => Promise<I_Collection[]>
  onSubmit: (settings: { knowledge: I_Knowledge_State }) => void
}

export const charmId: T_CharmId = 'memory'

// A menu to select from a list of collections
export const KnowledgeCharmMenu = (props: I_Props) => {
  const { fetchListAction, dialogOpen, setDialogOpen, onSubmit } = props
  const {
    disableForm,
    setDisableForm,
    selected,
    setSelected,
  } = useKnowledgeMenu()

  const knowledgeMenu = useMemo(() =>
    <KnowledgeTab
      selected={selected}
      setSelected={setSelected}
      fetchListAction={fetchListAction}
      disableForm={disableForm}
      setDisableForm={setDisableForm}
    />, [disableForm, fetchListAction, selected, setDisableForm, setSelected])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        {knowledgeMenu}

        <Separator className="my-4" />

        {/* Buttons */}
        <DialogFooter className="items-center">
          <Button
            disabled={disableForm}
            variant="ghost"
            className="w-full sm:w-32"
            onClick={() => {
              // Reset state
              setSelected([])
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={disableForm}
            className="w-full sm:w-32"
            onClick={async () => {
              setDisableForm(true)
              // Save the list based on currently selected checkboxes
              const payload = { knowledge: { index: selected } }
              onSubmit(payload)
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
