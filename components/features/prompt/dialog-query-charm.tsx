'use client'

import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from 'react'
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
  selected: MutableRefObject<string[]> // Tracks currently selected collections
}

// A menu to select from a list of collections
export const QueryCharmMenu = (props: I_Props) => {
  const charmId: T_CharmId = 'memory'
  const { selected, fetchListAction, dialogOpen, setDialogOpen, removeCharm, onSubmit } = props
  const [disableForm, setDisableForm] = useState(false)
  const [collections, setCollections] = useState<I_Collection[]>([])
  const checkboxCallbacks = useRef<{ [key: string]: Dispatch<SetStateAction<boolean>> }>({}) // Func to check/uncheck
  const checkboxes = useRef<string[]>([]) // Tracks all checkbox states
  const renderDefaultMsg = <div className="font-semibold">No collections added yet.</div>

  const CollectionItem = ({ item, index }: { item: I_Collection, index: number }) => {
    const itemName = item.name
    const [isChecked, setIsChecked] = useState<boolean>(false)
    const [doOnce, setDoOnce] = useState(false)

    const onChange = () => setIsChecked((c) => {
      const newResult = !c
      // Set checked list state
      if (newResult) checkboxes.current = [...checkboxes.current, itemName]
      else {
        const indItem = checkboxes.current.findIndex(i => i === itemName)
        checkboxes.current.splice(indItem, 1)
      }
      // Set checkbox state
      return newResult
    })

    // Set checkboxes from parent state
    useEffect(() => {
      if (!doOnce && dialogOpen) {
        setIsChecked(selected.current.includes(itemName))
        setDoOnce(true)
      }
    }, [doOnce, itemName])

    // Record all item's checkbox callback funcs
    useEffect(() => {
      checkboxCallbacks.current[itemName] = setIsChecked
    }, [itemName])

    return (
      <span key={item.id} className="flex flex-row items-center space-x-8">
        <Root
          id={`c${index}`}
          checked={isChecked}
          onCheckedChange={onChange}
          className="flex h-6 w-6 items-center justify-center rounded border border-gray-800 bg-black hover:bg-gray-900 hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]"
        >
          <Indicator>
            <CheckIcon className="h-4 w-4" />
          </Indicator>
        </Root>
        <label className="w-full flex-1" htmlFor={`c${index}`}>
          <CollectionCard
            collection={item}
            onClick={onChange}
          />
        </label>
      </span>
    )
  }

  const CollectionsList = ({ list }: { list: I_Collection[] }) => {
    // Scrollable List Container (fixed height)
    return <div className="scrollbar flex max-h-[32rem] w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2 pr-4">
      {list.map((item, i) => <CollectionItem key={item.id} item={item} index={i} />)}
    </div>
  }

  // const onCallback = (inputPrompt: string) => {
  //   const mentionsArr = selected.current.map(name => `@${name}`)
  //   const mentions = mentionsArr.join(' ')
  //   // We want to find all current @mentions and overwrite them
  //   const regexPattern = /^@\w+(\s+@\w+)*$/
  //   const strippedPrompt = inputPrompt.replace(regexPattern, '')
  //   // Take the prompt and add ids as @mentions seperated by spaces
  //   const outputPrompt = `${mentions} ${strippedPrompt}`
  //   return outputPrompt
  // }

  const onCallback = () => selected.current

  // Fetch the collections list when opened
  useEffect(() => {
    const action = async () => {
      const result = await fetchListAction()
      if (result) setCollections(result)
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

        {/* Header buttons */}
        <div className="flex w-full flex-row items-center justify-between space-x-4">
          <Button
            disabled={disableForm}
            className="m-0 w-full p-0"
            onClick={async () => {
              // Add all collections to list
              checkboxes.current = [...collections.map(i => i.name)]
              // Set all checkbox states
              Object.values(checkboxCallbacks.current).forEach(check => check(true))
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
              // Remove all collections from list
              checkboxes.current = []
              // Set all checkbox states
              Object.values(checkboxCallbacks.current).forEach(check => check(false))
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Remove all
          </Button>
        </div>

        <Separator className="my-4" />

        {/* List of collections */}
        {collections?.length ? <CollectionsList list={collections} /> : renderDefaultMsg}

        <Separator className="my-4" />

        {/* Buttons */}
        <DialogFooter className="items-center">
          <Button
            disabled={disableForm}
            variant="ghost"
            className="w-full sm:w-32"
            onClick={() => {
              // Reset list
              checkboxes.current = []
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
                selected.current = [...checkboxes.current]
                // Make a charm struct
                const mentions = onCallback()?.map(name => `@${name}`).join(' ')
                const charm: I_Charm = {
                  id: charmId,
                  toolTipText: mentions,
                  onCallback,
                }
                // Add the charm to prompt
                onSubmit(charm)
              } else {
                // Remove ourselves from active charm list
                removeCharm(charmId)
                // Reset state
                selected.current = []
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
