'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { I_Tools_Settings } from '@/lib/homebrew'

type I_Submit_Tool_Settings = Omit<I_Tools_Settings, 'id'>

interface I_Props {
  state: I_Submit_Tool_Settings,
  setState: Dispatch<SetStateAction<I_Submit_Tool_Settings>>
}

export const defaultState: I_Submit_Tool_Settings = {
  name: '',
  path: '',
  description: '',
  args: [],
}

export const AddToolTab = (props: I_Props) => {
  const { state, setState } = props

  const argtypes = [
    {
      name: 'string',
      value: 'string'
    },
    {
      name: 'number',
      value: 'number'
    },
    {
      name: 'boolean',
      value: 'boolean'
    },
    {
      name: 'array',
      value: 'array'
    },
    {
      name: 'dictionary',
      value: 'dictionary'
    }
  ]

  const addNewArgumentInput = () => {
    setState(prev => {
      const ergs = { ...prev }
      const newArgs = ergs.args
      newArgs.push({ someValue: 'string' })
      return { ...prev, args: newArgs }
    })
  }

  return (
    <div className="px-1">
      {/* Add new tool */}
      <DialogHeader className="my-8">
        <DialogTitle className="text-md">Define your new Ai tool</DialogTitle>
        <DialogDescription className="mb-4">
          Tools are used by bots to extend their capabilities. They will execute the code you specify in a safe environment.
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
                name="url"
                value={state.path}
                placeholder="Code path (file::// or https://)"
                onChange={e => setState(prev => ({ ...prev, url: e.target.value }))}
                className="text-md"
              />
            </div>
            {/* Tool arguments */}
            <div className="flex w-full flex-col gap-4">
              {state.args.map((arg, index) => {
                const name = Object.entries(arg)[0][0]
                const type = Object.entries(arg)[0][1]

                return (
                  <div
                    key={index}
                    className="flex flex-row gap-4"
                  >
                    {/* Argument name */}
                    <Input
                      name={`${index}-name`}
                      value={name}
                      placeholder="Argument Name"
                      onChange={e => setState(prev => {
                        const newArgs = prev.args
                        newArgs[index] = { [e.target.value]: type }
                        return { ...prev, args: newArgs }
                      })}
                      className="text-md"
                    />
                    {/* Argument type */}
                    <Select
                      id={`${index}-type`}
                      name="Argument type"
                      value={type || undefined}
                      placeholder="Argument type"
                      items={argtypes}
                      className="text-md"
                      onChange={val => setState(prev => {
                        const newArgs = prev.args
                        newArgs[index] = { [name]: val }
                        return { ...prev, args: newArgs }
                      })}
                    />
                  </div>
                )
              })}
              <Button variant="outline" className="text-md w-full overflow-hidden px-2 py-4" onClick={addNewArgumentInput}>Add Argument (optional)</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
