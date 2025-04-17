'use client'

import { Dispatch, SetStateAction, useEffect } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ToolPanelCard } from '@/components/features/panels/panel-card-tool'
import { MultiSelector } from '@/components/ui/multi-toggle'
import { useGlobalContext } from '@/contexts'

interface I_Props {
  fetchListAction: () => Promise<void>
  setSelected: Dispatch<SetStateAction<string[]>>
  selected: string[]
}

export const defaultState = {
  assigned: [],
}

export const ToolsTab = (props: I_Props) => {
  const { fetchListAction, setSelected, selected } = props
  const { tools } = useGlobalContext()
  const renderDefaultMsg = <div className="font-semibold">No tools added yet.</div>

  // Fetch the tools list when opened
  useEffect(() => {
    fetchListAction()
  }, [fetchListAction])

  return (
    <div className="overflow-hidden px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Assign tools</DialogTitle>
        <DialogDescription className="text-md mb-4">
          {'Select one or more tools for the Ai to use when generating a response. An agent will always attempt to use tools if any are assigned. If only one tool is assigned, it will be chosen by default. It is highly recommended to use either "Instruct" or "Function Calling" capable models when using tools.'}
        </DialogDescription>
      </DialogHeader>

      <MultiSelector
        initValue={selected}
        onSubmit={setSelected}
        options={tools?.map?.(tool => tool.name)}
        className="min-h-[5rem] w-full sm:w-full"
      >
        {tools?.map?.(item => {
          return <ToolPanelCard
            key={item.id}
            name={item.name}
            icon="🔧"
            description={item.description}
            path={item.path}
          />
        }) ?? renderDefaultMsg}
      </MultiSelector>
    </div>
  )
}
