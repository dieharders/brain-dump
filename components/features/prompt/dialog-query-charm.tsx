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
import { CheckIcon } from '@radix-ui/react-icons'
import { Root, Indicator } from '@radix-ui/react-checkbox'
import { IconSpinner } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { I_Collection } from '@/lib/homebrew'
import { CollectionCard } from '@/components/sidebar-item-brain'
import { Separator } from '@/components/ui/separator'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  fetchListAction: () => Promise<I_Collection[]>
  onSubmit: () => void
}

// A menu to select from a list of collections
export const QueryCharmMenu = (props: I_Props) => {
  const { fetchListAction, dialogOpen, setDialogOpen, onSubmit } = props
  const [disableForm, setDisableForm] = useState(false)
  const [collections, setCollections] = useState<I_Collection[]>([])
  const renderDefaultMsg = <div className="font-semibold">You have not added any collections yet.</div>
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const CollectionsList = ({ list }: { list: I_Collection[] }) => {
    const items = list.map((item, i) => {
      const isChecked = checkedItems.includes(item.id)
      const setChecked = () => {
        // add item
        if (!isChecked) setCheckedItems([...checkedItems, item.id])
        // remove item from list
        else {
          const index = checkedItems.indexOf(item.id)
          const newList = [...checkedItems]
          newList.splice(index, 1)
          setCheckedItems(newList)
        }
      }

      // Render collection cards
      return (
        <span key={item.id} className="flex flex-row items-center space-x-8" >
          <Root onCheckedChange={setChecked} checked={isChecked} className="flex h-8 w-8 items-center justify-center rounded border border-gray-800 bg-black hover:bg-gray-900 hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]" id={`c${i}`}>
            <Indicator>
              <CheckIcon />
            </Indicator>
          </Root>
          <label className="w-full flex-1" htmlFor={`c${i}`}>
            <CollectionCard collection={item} />
          </label>
        </span>
      )
    })
    // List Container
    return <div className="flex w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2">
      {items}
    </div>
  }

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
        {/* Description */}
        <DialogHeader>
          <DialogTitle>Choose one or more collections to query</DialogTitle>
          <DialogDescription>
            Select the collections you want the Ai to discuss exclusively and ignore all other knowledge.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-4" />

        {/* List of collections */}
        {collections.length ? <CollectionsList list={collections} /> : renderDefaultMsg}

        <Separator className="my-4" />

        {/* Buttons */}
        <DialogFooter className="items-center">
          <Button
            disabled={disableForm}
            variant="ghost"
            className="w-full sm:w-32"
            onClick={() => {
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
