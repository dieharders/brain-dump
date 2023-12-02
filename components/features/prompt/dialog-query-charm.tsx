'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  fetchListAction: () => Promise<any[]>
  onSubmit: () => void
}

// A menu to select from a list of collections
export const QueryCharmMenu = (props: I_Props) => {
  const { fetchListAction, dialogOpen, setDialogOpen, onSubmit } = props
  const [disableForm, setDisableForm] = useState(false)
  const [collections, setCollections] = useState<any[]>([])
  const renderDefaultList = <div className="font-semibold">You havent added any collections yet.</div>
  const renderCollectionsList = collections.map(item => <p key={item.id}>{item.name}</p>)

  // Fetch the collections list when opened
  useEffect(() => {
    const action = async () => {
      const result = await fetchListAction()
      setCollections(result)
    }
    if (dialogOpen) action()
  }, [dialogOpen, fetchListAction])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose one or more collections to query</DialogTitle>
          <DialogDescription>
            Select the collections you want the Ai to discuss exclusively and ignore all other knowledge.
          </DialogDescription>
        </DialogHeader>
        {/* List of collections */}
        {collections.length ? renderCollectionsList : renderDefaultList}
        <DialogFooter className="items-center">
          <Button
            disabled={disableForm}
            variant="ghost"
            onClick={() => {
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={disableForm}
            onClick={async () => {
              setDisableForm(true)
              onSubmit()
              setDialogOpen(false)
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>)
}
