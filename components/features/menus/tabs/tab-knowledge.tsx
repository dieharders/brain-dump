'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { I_Collection, I_Knowledge_State, T_Memory_Type } from '@/lib/homebrew'
import { Separator } from '@/components/ui/separator'
import { Root, Indicator } from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { CollectionCard } from '@/components/features/panels/collection-card'
import ToggleGroup from '@/components/ui/toggle-group'
import { IconBrain, IconDocument } from '@/components/ui/icons'
import { DEFAULT_TYPE } from '@/components/features/menus/charm/hook-charm-knowledge'
import { useGlobalContext } from '@/contexts'

interface I_Props {
  fetchListAction: () => Promise<I_Collection[]>
  type: T_Memory_Type
  setType: Dispatch<SetStateAction<T_Memory_Type>>
  selected: string[]
  setSelected: Dispatch<SetStateAction<string[]>>
  disableForm: boolean
  setDisableForm: Dispatch<SetStateAction<boolean>>
}

export const defaultState: I_Knowledge_State = {
  type: DEFAULT_TYPE,
  index: [],
}

export const KnowledgeTab = (props: I_Props) => {
  const { collections, setCollections } = useGlobalContext()
  const { fetchListAction, type, setType, disableForm, setDisableForm, setSelected, selected } = props
  const toggleGroupClass = "flex flex-row gap-2 rounded p-2"
  const renderDefaultMsg = <div className="font-semibold">No collections added yet.</div>

  const CollectionItem = ({ item, index }: { item: I_Collection, index: number }) => {
    const itemName = item.name
    const [isActive, setIsActive] = useState(false)
    const selectedItem = selected.find(name => name === itemName)
    const isInList = typeof selectedItem !== 'undefined'

    const onChange = useCallback(() => {
      if (!isInList) {
        setSelected([...selected, itemName])
      }
      else {
        const indItem = selected.findIndex(i => i === itemName)
        const newVal = [...selected]
        newVal.splice(indItem, 1)
        setSelected(newVal)
      }
    }, [isInList, itemName])

    return (
      <span key={item.id} className="justify-left flex w-full flex-row items-center space-x-8">
        <Root
          id={`c${index}`}
          checked={isInList}
          onCheckedChange={onChange}
          onMouseEnter={() => setIsActive(true)}
          onMouseLeave={() => setIsActive(false)}
          className="h-6 w-6 flex-none items-center justify-center rounded border border-gray-800 bg-background hover:shadow-[0_0_0.5rem_0.1rem_rgba(10,10,10,0.5)] dark:hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]"
        >
          <Indicator>
            <CheckIcon className="h-4 w-4" />
          </Indicator>
        </Root>
        <label
          className="w-full flex-1"
          htmlFor={`c${index}`}
        >
          <CollectionCard
            isActive={isActive}
            isSelected={isInList}
            collection={item}
            onClick={onChange}
            className="w-full sm:w-full"
          />
        </label>
      </span>
    )
  }

  const CollectionsList = () => {
    // Scrollable List Container (fixed height)
    return <div className="scrollbar flex max-h-[32rem] w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2">
      {collections?.map((item, i) => <CollectionItem key={item.id} item={item} index={i} />)}
    </div>
  }

  const Content = () => {
    return (
      <>
        <p className="mt-4 text-muted-foreground">Select one or more collections of private data you have previously uploaded to the Knowledge Base.</p>
        <Separator className="my-4" />

        {/* Collections Header buttons */}
        <div className="mb-6 flex w-full flex-row items-center justify-between space-x-4">
          <Button
            disabled={disableForm}
            className="m-0 w-full p-0"
            onClick={() => {
              // Add all collections to list
              setSelected([...collections.map(i => i.name)])
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
              setSelected([])
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Remove all
          </Button>
        </div>
        {/* List of collections */}
        {collections?.length ? <CollectionsList /> : renderDefaultMsg}
      </>
    )
  }

  // Fetch the collections list when opened
  useEffect(() => {
    const action = async () => {
      const result = await fetchListAction()
      if (result) setCollections(result)
    }
    action()
  }, [fetchListAction, setCollections])

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Pick a Knowledge Source</DialogTitle>
        <DialogDescription className="mb-4">
          {`Every LLM model is trained on finite sets of data from different sources (public and private). However if you wish for your Ai's knowledge to be grounded in specific data that you own, you can assign a vector index for it to only source responses from.`}
        </DialogDescription>
      </DialogHeader>

      {/* Mode Picker */}
      <div className="w-full">
        <ToggleGroup
          label="Knowledge Mode"
          value={type}
          onChange={val => {
            // Record mode state
            setType(val as T_Memory_Type)
          }}
        >
          <div id="training" className={toggleGroupClass}>
            <IconDocument className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Training</span>
          </div>
          <div id="augmented_retrieval" className={toggleGroupClass}>
            <IconBrain className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Augmented Retrieval</span>
          </div>
        </ToggleGroup>
      </div>

      {/* Content */}
      {type !== DEFAULT_TYPE ? <Content /> : <p className="mt-4 text-muted-foreground">Use the knowledge gained during training. This LLM was trained on all the data on the internet (probably).</p>}
    </div>
  )
}
