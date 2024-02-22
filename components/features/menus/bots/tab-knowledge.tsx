'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { I_Collection } from '@/lib/homebrew'
import { Separator } from '@/components/ui/separator'
import { Root, Indicator } from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { CollectionCard } from '@/components/sidebar-item-brain'
import ToggleGroup from '@/components/ui/toggle-group'
import { IconBrain, IconDocument } from '@/components/ui/icons'

export interface I_State {
  type: T_Type
  index: string[]
}

interface I_Props {
  fetchListAction: () => Promise<I_Collection[]>
  state: I_State
  setState: Dispatch<SetStateAction<I_State>>
}

export type T_Type = 'training' | 'augmented_retrieval'

export const DEFAULT_TYPE = 'training'

export const defaultState: I_State = {
  type: DEFAULT_TYPE,
  index: []
}

export const KnowledgeTab = (props: I_Props) => {
  const { fetchListAction, state, setState } = props
  const toggleGroupClass = "flex flex-row gap-2 rounded p-2"
  const checkboxes = state.index
  const [disableForm, setDisableForm] = useState(false)
  const [collections, setCollections] = useState<I_Collection[]>([])
  const renderDefaultMsg = <div className="font-semibold">No collections added yet.</div>

  const CollectionItem = ({ item, index }: { item: I_Collection, index: number }) => {
    const itemName = item.name
    const isChecked = checkboxes.find(i => i === itemName) ? true : false

    const onChange = (checked: boolean) => {
      // Set checked list state
      if (checked) setState(prev => ({ ...prev, index: [...checkboxes, itemName] }))
      else {
        const indexes = [...checkboxes]
        const indItem = indexes.findIndex(i => i === itemName)
        indexes.splice(indItem, 1)
        setState(prev => ({ ...prev, index: indexes }))
      }
    }

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
            onClick={() => onChange(!isChecked)}
          />
        </label>
      </span>
    )
  }

  const CollectionsList = () => {
    // Scrollable List Container (fixed height)
    return <div className="scrollbar flex max-h-[32rem] w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2 pr-4">
      {collections.map((item, i) => <CollectionItem key={item.id} item={item} index={i} />)}
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
            onClick={async () => {
              // Add all collections to list
              setState({ type: 'augmented_retrieval', index: [...collections.map(i => i.name)] })
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
              setState({ type: 'augmented_retrieval', index: [] })
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
  }, [fetchListAction])

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
          value={state.type}
          onChange={val => {
            // Record mode state
            setState({ index: checkboxes, type: val as T_Type })
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
      {state.type !== DEFAULT_TYPE ? <Content /> : <p className="mt-4 text-muted-foreground">Use the knowledge gained during training. This LLM was trained on all the data on the internet (probably).</p>}
    </div>
  )
}