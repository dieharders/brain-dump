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
import { I_Charm, T_CharmId } from '@/components/features/prompt/prompt-charm-menu'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  fetchListAction: () => Promise<I_Collection[]>
  onSubmit: (charm: I_Charm) => void
  removeCharm: (id: T_CharmId) => void
}

// A menu to select from a list of collections
export const QueryCharmMenu = (props: I_Props) => {
  const charmId: T_CharmId = 'memory'
  const { fetchListAction, dialogOpen, setDialogOpen, removeCharm, onSubmit } = props
  const [disableForm, setDisableForm] = useState(false)
  const [collections, setCollections] = useState<I_Collection[]>([])
  const renderDefaultMsg = <div className="font-semibold">You have not added any collections yet.</div>
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])

  const CollectionsList = ({ list }: { list: I_Collection[] }) => {
    const items = list.map((item, i) => {
      const itemName = item.name
      const isChecked = selectedMemories.includes(itemName)
      const setChecked = () => {
        // add item
        if (!isChecked) setSelectedMemories([...selectedMemories, itemName])
        // remove item from list
        else {
          const index = selectedMemories.indexOf(itemName)
          const newList = [...selectedMemories]
          newList.splice(index, 1)
          setSelectedMemories(newList)
        }
      }

      // Render collection cards
      return (
        <span key={item.id} className="flex flex-row items-center space-x-8" >
          <Root onCheckedChange={setChecked} checked={isChecked} className="flex h-6 w-6 items-center justify-center rounded border border-gray-800 bg-black hover:bg-gray-900 hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]" id={`c${i}`}>
            <Indicator>
              <CheckIcon className="h-4 w-4" />
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

  const onPromptCallback = (inputPrompt: string) => {
    const mentionsArr = selectedMemories.map(name => `@${name}`)
    const mentions = mentionsArr.join(' ')
    // We want to find all current @mentions and overwrite them
    const regexPattern = /^@\w+(\s+@\w+)*$/
    const strippedPrompt = inputPrompt.replace(regexPattern, '')
    // Take the prompt and add ids as @mentions seperated by spaces
    const outputPrompt = `${mentions} ${strippedPrompt}`
    return outputPrompt
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

        <Button
          disabled={disableForm}
          className="m-0 mt-4 w-full p-0"
          onClick={async () => {
            // Add all collections to list
            setSelectedMemories([...collections.map(i => i.name)])
            setDisableForm(false)
          }}
        >
          {disableForm && <IconSpinner className="mr-2 animate-spin" />}
          Add all
        </Button>
        <Button
          disabled={disableForm}
          className="m-0 w-full p-0"
          onClick={async () => {
            // Remove ourselves from active charm list
            removeCharm(charmId)
            // Reset state
            setSelectedMemories([])
            setDisableForm(false)
          }}
        >
          {disableForm && <IconSpinner className="mr-2 animate-spin" />}
          Remove all
        </Button>

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
              // Only save if we selected something
              if (selectedMemories.length) {
                const charm = {
                  id: charmId,
                  toolTipText: onPromptCallback(''),
                  onPromptCallback,
                }
                onSubmit(charm)
              } else {
                // Remove ourselves from active charm list
                removeCharm(charmId)
                // Reset state
                setSelectedMemories([])
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
    </Dialog>)
}
