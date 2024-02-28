'use client'

import { MutableRefObject, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { I_Collection, T_Memory_Type } from '@/lib/homebrew'
import { Separator } from '@/components/ui/separator'
import { I_Charm, T_CharmId } from '@/components/features/prompt/prompt-charm-menu'
import { KnowledgeTab } from '@/components/features/menus/tabs/tab-knowledge'
import { useKnowledgeMenu } from '@/components/features/menus/charm/hook-charm-knowledge'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  fetchListAction: () => Promise<I_Collection[]>
  onSubmit: (charm: I_Charm, settings: { type: T_Memory_Type, index: string[] }) => void
  removeCharm: (id: T_CharmId) => void
  checkboxes: MutableRefObject<string[]>
}

// A menu to select from a list of collections
export const KnowledgeCharmMenu = (props: I_Props) => {
  const charmId: T_CharmId = 'memory'
  const { checkboxes, fetchListAction, dialogOpen, setDialogOpen, removeCharm, onSubmit } = props
  const {
    disableForm,
    setDisableForm,
    collections,
    setCollections,
    type,
    setType,
    selected,
    setSelected,
  } = useKnowledgeMenu()

  const knowledgeMenu = useMemo(() =>
    <KnowledgeTab
      type={type}
      setType={setType}
      selected={selected}
      setSelected={setSelected}
      fetchListAction={fetchListAction}
      collections={collections}
      setCollections={setCollections}
      disableForm={disableForm}
      setDisableForm={setDisableForm}
      checkboxes={checkboxes}
    />, [checkboxes, collections, disableForm, fetchListAction, selected, setCollections, setDisableForm, setSelected, setType, type])

  const onCallback = () => checkboxes.current

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
              // Reset list
              // checkboxes.current = []
              // setSelected([])
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
              // Only save if we selected something
              if (checkboxes.current.length) {
                // Save the list based on current checkboxes
                // checkboxes.current = ([...checkboxes.current])
                // Make a charm struct
                const mentions = onCallback()?.map(name => `@${name}`).join(' ')
                const charm: I_Charm = {
                  id: charmId,
                  toolTipText: mentions,
                  onCallback,
                }
                // Add the charm to prompt
                onSubmit(charm, { type, index: checkboxes.current })
              } else {
                // Remove ourselves from active charm list
                removeCharm(charmId)
                // Reset state
                checkboxes.current = []
              }
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
