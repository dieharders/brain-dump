'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { I_Tool_Definition } from '@/lib/homebrew'
import { cn } from '@/lib/utils'

interface I_Props {
  state: I_Tool_Definition,
  setState: Dispatch<SetStateAction<I_Tool_Definition>>
}

export const defaultState: I_Tool_Definition = {
  name: '',
  path: '',
  description: '',
  arguments: '',
  example_arguments: '',
}

export const AddToolTab = (props: I_Props) => {
  const { state, setState } = props
  const textareaStyle = cn("text-md scrollbar min-h-[8rem] w-full rounded border-2 p-2 outline-none focus:border-primary/50")

  return (
    <div className="px-1">
      {/* Add new tool */}
      <DialogHeader className="my-8">
        <DialogTitle className="text-md">Define a function for your tool</DialogTitle>
        <DialogDescription className="mb-4">
          Tools are used by bots to extend their capabilities. They will execute code you specify in a safe environment.
        </DialogDescription>
      </DialogHeader>
      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 pb-4">
          <div className="flex flex-col gap-4">
            {/* Tool Name */}
            <div className="w-full">
              <Input
                name="name"
                value={state.name}
                placeholder="Name (3-63 lowercase chars)"
                onChange={e => {
                  let parsed = e.target.value.toLowerCase()
                  parsed = parsed.replace(/[^a-zA-Z0-9]/g, '')
                  setState(prev => ({ ...prev, name: parsed }))
                }}
                className="text-md"
              />
            </div>
            {/* Tool description, only display for already added tool */}
            {state.id && <div className="w-full">
              <Input
                name="description"
                value={state.description}
                placeholder="Description (optional, 100 chars)"
                onChange={e => setState(prev => ({ ...prev, description: e.target.value }))}
                className="text-md"
              />
            </div>}
            {/* Tool path */}
            <div className="w-full">
              <Input
                name="path"
                value={state.path}
                placeholder="filename.ext or https://"
                onChange={e => setState(prev => ({ ...prev, path: e.target.value }))}
                className="text-md"
              />
            </div>
            <div className="flex w-full flex-col gap-4">
              {/* Tool arguments */}
              <div
                className="flex w-full flex-col items-center gap-2"
              >
                <DialogTitle className="self-justify-start self-start text-sm">Arguments schema</DialogTitle>
                <textarea
                  /* (arguments) multi-line text input */
                  name="arguments-input"
                  value={typeof state.arguments === 'string' ? state.arguments : ''}
                  placeholder="{}"
                  disabled
                  onChange={e => setState(prev => ({ ...prev, arguments: e.target.value }))}
                  className={textareaStyle}
                />
              </div>
              {/* Tool example output */}
              <div
                className="flex w-full flex-col items-center gap-2"
              >
                <DialogTitle className="self-justify-start self-start text-sm">Example output</DialogTitle>
                <textarea
                  /* (example) multi-line text input */
                  name="example-input"
                  value={typeof state.example_arguments === 'string' ? state.example_arguments : ''}
                  placeholder="{}"
                  disabled
                  onChange={e => setState(prev => ({ ...prev, example_arguments: e.target.value }))}
                  className={textareaStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
