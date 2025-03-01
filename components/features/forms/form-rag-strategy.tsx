'use client'

import { useMemo } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Highlight, Info } from '@/components/ui/info'
import { Input } from '@/components/ui/input'
import { I_RAG_Strat_State as I_State } from '@/lib/homebrew'

interface I_Props {
  state: I_State,
  setState: (val: I_State) => void
  ragModes: string[],
}

// Default state values
export const defaultState = {
  similarity_top_k: 1,
  response_mode: undefined,
}

export const RAGStrategyForm = (props: I_Props) => {
  const { state, setState, ragModes } = props
  const infoClass = 'flex w-full flex-row gap-2'
  const inputContainerClass = 'grid w-full gap-1'

  const responseModes = useMemo(() => {
    const parseName = (str: string) => {
      const list = str.split('_')
      const words = list.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      return words.join(' ')
    }
    return ragModes?.map(mode => ({
      name: parseName(mode),
      value: mode
    }))
  }, [ragModes])

  return (
    <>
      {/* RAG Options ONLY */}
      <DialogHeader className="my-8">
        <DialogTitle>Memory Retrieval</DialogTitle>
        <DialogDescription>
          Only applies to queries that use external memories as context.
        </DialogDescription>
      </DialogHeader>

      {/* RAG Options Content */}
      <div className="grid-auto-flow m-auto mb-2 grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4">
        {/* Max Number of Results (similarity_top_k) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Num matching results</Label>
            <Info label="similarity_top_k">
              <span><Highlight>similarity_top_k</Highlight> determines how many matching documents to consider when synthesizing a response.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.similarity_top_k}
            min={1}
            step={1}
            placeholder={defaultState?.similarity_top_k?.toString()}
            className="w-full"
            onChange={event => setState({ ...state, similarity_top_k: parseInt(event.target.value) })}
          />
        </div>

        {/* Type of response (response_mode) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Response Mode</Label>
            <Info label="response_mode">
              <span><Highlight>response_mode</Highlight> determines how the LLM responds to the context.</span>
            </Info>
          </div>
          <div className="w-full">
            <Select
              id="rag_response_select"
              placeholder="Select Response Mode"
              name="Select Response Mode"
              value={state?.response_mode}
              items={[{ name: 'Response modes', isLabel: true }, ...responseModes]}
              onChange={(value: string) => setState({ ...state, response_mode: value })}
              className="py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </>
  )
}
