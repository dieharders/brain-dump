'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { I_Tools_Settings } from '@/lib/homebrew'
import { Root, Indicator } from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { ToolCard } from '@/components/features/panels/tool-card'
import { useGlobalContext } from '@/contexts'

interface I_Props {
  fetchListAction: () => Promise<void>
  selected: string[]
  setSelected: Dispatch<SetStateAction<string[]>>
  disableForm: boolean
  setDisableForm: Dispatch<SetStateAction<boolean>>
}

export const defaultState = {
  assigned: [],
}

export const ToolsTab = (props: I_Props) => {
  const { fetchListAction, disableForm, setDisableForm, setSelected, selected } = props
  const { tools } = useGlobalContext()
  const renderDefaultMsg = <div className="font-semibold">No tools added yet.</div>

  const ToolItem = ({ item, index }: { item: I_Tools_Settings, index: number }) => {
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
          className="flex items-center justify-center rounded border border-gray-800 bg-background hover:shadow-[0_0_0.5rem_0.1rem_rgba(10,10,10,0.5)] dark:hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]"
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <Indicator >
              <CheckIcon className="h-4 w-4" />
            </Indicator>
          </div>
        </Root>
        <label
          className="w-full flex-1 overflow-hidden"
          htmlFor={`c${index}`}
        >
          <ToolCard
            isActive={isActive}
            isSelected={isInList}
            item={item}
            onClick={onChange}
            className="min-h-[6rem] w-full sm:w-full"
          />
        </label>
      </span>
    )
  }

  const ToolsList = () => {
    // Scrollable List Container (fixed height)
    return <div className="scrollbar flex max-h-[32rem] w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2">
      {tools?.map((item, i) => <ToolItem key={item.id} item={item} index={i} />)}
    </div>
  }

  const Content = () => {
    return (
      <>
        {/* Header buttons */}
        <div className="mb-6 flex w-full flex-row items-center justify-between space-x-4">
          <Button
            disabled={disableForm}
            className="m-0 w-full p-0"
            onClick={() => {
              // Add all items to list
              setSelected([...tools.map(i => i.name)])
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
              // Remove all tools from list
              setSelected([])
              setDisableForm(false)
            }}
          >
            {disableForm && <IconSpinner className="mr-2 animate-spin" />}
            Remove all
          </Button>
        </div>
        {/* List of tools */}
        {tools?.length ? <ToolsList /> : renderDefaultMsg}
      </>
    )
  }

  // Fetch the tools list when opened
  useEffect(() => {
    fetchListAction()
  }, [fetchListAction])

  return (
    <div className="overflow-hidden px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Assign tools to this Bot</DialogTitle>
        <DialogDescription className="mb-4">
          Select one or more tools for the agent to use when generating a response.
        </DialogDescription>
      </DialogHeader>

      <Content />
    </div>
  )
}
