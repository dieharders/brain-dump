'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { I_SelItemData, MultiSelector } from '@/components/ui/multi-toggle'
import { MiniPanelCard } from '@/components/features/panels/panel-card-mini'
import { useMemoryActions } from '@/components/features/crud/actions'
import { I_Knowledge_State } from '@/lib/homebrew'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const defaultState: I_Knowledge_State = { ids: [] }

interface I_Props {
  state: I_Knowledge_State
  setState: Dispatch<SetStateAction<I_Knowledge_State>>
}

export const KnowledgeTab = (props: I_Props) => {
  const { setState, state } = props
  const { fetchCollections } = useMemoryActions()
  const [options, setOptions] = useState<any[]>([])

  const data = options?.map?.((i: I_SelItemData | string) => {
    if (typeof i === 'string') return { id: i, name: i }
    return i
  })

  // Fetch data
  useEffect(
    () => {
      const action = async () => {
        const response = await fetchCollections()
        response && setOptions(response?.map(d => ({ id: d.id, name: d.name, description: d.metadata?.description, icon: d.metadata?.icon })))
      }
      action()
    },
    [fetchCollections],
  )

  return (
    <div className="overflow-hidden px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Choose knowledge sources</DialogTitle>
        <DialogDescription className="text-md mb-4">
          Select context from your collections of private data for the Ai to ground responses in.
        </DialogDescription>
      </DialogHeader>

      {/* <Content /> */}

      <MultiSelector
        initValue={state.ids}
        onSubmit={(selections: any) => setState(prev => ({ ...prev, ids: selections }))}
        options={data?.map?.(p => p.name)}
        className="min-h-[5rem] w-full sm:w-full"
      >
        {data?.map?.(p => <MiniPanelCard key={p.id} name={p.name || 'No Title'} description={p.description || 'No description.'} icon={p.icon} />)}
      </MultiSelector>
    </div>
  )
}
