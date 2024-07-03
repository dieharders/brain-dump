'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { I_Tool_Definition } from '@/lib/homebrew'

interface I_Props {
  state: I_Tool_Definition,
  setState: Dispatch<SetStateAction<I_Tool_Definition>>
}

export const defaultState: I_Tool_Definition = {
  name: '',
  path: '',
  description: '',
  arguments: '',
  example_arguments: ''
}

export const AddToolTab = (props: I_Props) => {
  const { state, setState } = props
  const isEditMode = !!state.name
  const [argumentsInputType, setArgumentsInputType] = useState<string>(isEditMode ? 'custom' : 'auto')
  const [exampleInputType, setExampleInputType] = useState<string>(isEditMode ? 'custom' : 'auto')

  const argInputTypes = [
    {
      name: 'Write custom arguments',
      value: 'custom'
    },
    {
      name: 'Auto add arguments',
      value: 'auto'
    }
  ]

  const exampleInputTypes = [
    {
      name: 'Write custom example',
      value: 'custom'
    },
    {
      name: 'Auto add example',
      value: 'auto'
    }
  ]

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
            {/* Tool description */}
            <div className="w-full">
              <Input
                name="description"
                value={state.description}
                placeholder="Description (optional, 100 chars)"
                onChange={e => setState(prev => ({ ...prev, description: e.target.value }))}
                className="text-md"
              />
            </div>
            {/* Tool path */}
            <div className="w-full">
              <Input
                name="path"
                value={state.path}
                placeholder="Path to tool (filename or https://)"
                onChange={e => setState(prev => ({ ...prev, path: e.target.value }))}
                className="text-md"
              />
            </div>
            <div className="flex w-full flex-col gap-4">
              {/* Tool arguments */}
              <div
                className="flex w-full flex-col items-center gap-2"
              >
                <Select
                  /* Choose Custom/Auto arguments */
                  id="argument-type"
                  name="argument-type"
                  value={argumentsInputType}
                  placeholder="Auto/Manual arguments"
                  items={argInputTypes}
                  className="text-md h-full"
                  onChange={val => {
                    setArgumentsInputType(val)
                    // reset when setting to auto
                    if (argumentsInputType === 'custom') setState(prev => ({ ...prev, arguments: '' }))
                  }}
                />
                {(argumentsInputType === 'custom' || isEditMode) && <textarea
                  /* (arguments) multi-line text input */
                  name="arguments-input"
                  value={state.arguments}
                  disabled={isEditMode && argumentsInputType === 'auto'}
                  placeholder="{}"
                  onChange={e => setState(prev => ({ ...prev, arguments: e.target.value }))}
                  className="text-md scrollbar w-full rounded-md p-4"
                />}
              </div>
              {/* Tool example output */}
              <div
                className="flex w-full flex-col items-center gap-2"
              >
                <Select
                  /* Choose Custom/Auto example */
                  id="example-type"
                  name="example-type"
                  value={exampleInputType}
                  placeholder="Auto/Manual example"
                  items={exampleInputTypes}
                  className="text-md h-full"
                  onChange={val => {
                    setExampleInputType(val)
                    // reset when setting to auto
                    if (exampleInputType === 'custom') setState(prev => ({ ...prev, example_arguments: '' }))
                  }}
                />
                {(exampleInputType === 'custom' || isEditMode) && <textarea
                  /* (example) multi-line text input */
                  name="example-input"
                  value={state.example_arguments}
                  disabled={isEditMode && exampleInputType === 'auto'}
                  placeholder="{}"
                  onChange={e => setState(prev => ({ ...prev, example_arguments: e.target.value }))}
                  className="text-md scrollbar w-full rounded-md p-4"
                />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
