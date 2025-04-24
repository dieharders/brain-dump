'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { I_Tool_Definition } from '@/lib/homebrew'
import { useGlobalContext } from '@/contexts'
import { cn } from '@/lib/utils'
import { ToolParameterInput } from '@/components/features/menus/tabs/tool-param-input'

// Data from the stored tool def
interface I_Props {
  state: I_Tool_Definition,
  setState: Dispatch<SetStateAction<I_Tool_Definition>>
  savedState?: I_Tool_Definition
}

export const AddToolTab = (props: I_Props) => {
  const { services } = useGlobalContext()
  const { state, setState, savedState } = props
  const [availableFuncs, setAvailableFuncs] = useState([])
  const [selectedFunction, setSelectedFunction] = useState<string>()
  const params = savedState?.params || state.params
  const dialogTitleStyle = cn('self-justify-start self-start text-sm')
  const textareaStyle = cn('text-md scrollbar min-h-[8rem] w-full rounded border-2 p-2 text-[dimgrey] outline-none focus:border-primary/50')

  // Fetch tool function names
  useEffect(() => {
    const action = async () => {
      const res = await services?.storage.getToolFunctions()
      if (res?.success && res?.data) {
        const data = res?.data.map((name: string) => ({
          name: name,
          value: name,
          isLabel: false,
        }))
        setAvailableFuncs(data)
      }
    }
    action()
  }, [services?.storage])

  return (
    <div className="px-1">
      {/* Add new tool */}
      {!savedState?.id &&
        <DialogDescription className="mb-8">
          Extend the capabilities of Agents and execute code you specify in a safe environment.
        </DialogDescription>
      }
      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">
        <div className="flex w-full flex-col items-stretch justify-items-stretch gap-4 pb-4">
          <div className="flex flex-col gap-4">
            {/* Tool Name */}
            <DialogTitle className={dialogTitleStyle}>Tool Name</DialogTitle>
            <div className="w-full">
              <Input
                name="name"
                defaultValue={savedState?.id ? savedState?.name : state?.name}
                placeholder="Name (3-63 lowercase chars)"
                onChange={e => {
                  let parsed = e.target.value.toLowerCase()
                  parsed = parsed.replace(/[^a-zA-Z0-9]/g, '')
                  setState(prev => ({ ...prev, name: parsed }))
                }}
                className="text-md"
              />
            </div>
            {/* Select tool function path */}
            {savedState?.id
              ?
              <>
                <DialogTitle className={dialogTitleStyle}>Tool File</DialogTitle>
                <div className="mb-4 w-full">{savedState?.path}</div>
              </>
              :
              <>
                <DialogTitle className={dialogTitleStyle}>Select a function for your tool<DialogDescription className="mt-2 font-normal">Hint: Add your own functions to <button className="text-primary underline">_deps/tools/functions</button> install directory.</DialogDescription></DialogTitle>
                <div className="mb-4 w-full">
                  <Select
                    id="tool_function_select"
                    placeholder="Select a function"
                    name="Select a tool function"
                    value={undefined}
                    items={availableFuncs}
                    onChange={e => {
                      if (!e) return
                      setSelectedFunction(e)
                      // Fetch the selected function's schema to display its' parameters
                      const action = async () => {
                        const payload = { filename: e, tool_name: state.name }
                        const res = await services?.storage.getToolSchema({ queryParams: payload })
                        if (res?.success && res?.data) setState(prev => ({ ...prev, ...res?.data, path: e }))
                      }
                      action()
                    }}
                  />
                </div>
              </>
            }
            {/* Tool description */}
            {(selectedFunction || savedState?.id) && <>
              <DialogTitle className={dialogTitleStyle}>Tool Description</DialogTitle>
              <div className="mb-4 w-full">
                <Input
                  name="description"
                  defaultValue={savedState?.id ? savedState?.description : state.description}
                  placeholder="Add description (optional, 100 chars)"
                  onChange={e => setState(prev => ({ ...prev, description: e.target.value }))}
                  className="text-md"
                />
              </div>
            </>
            }
            {/* Tool Info */}
            <div className="flex w-full flex-col gap-4">
              {(selectedFunction || savedState?.id) && params?.map(param => {
                // Parameter Fields
                return (
                  <div
                    key={param.name}
                    className="mb-4 flex w-full flex-col items-center gap-2"
                  >
                    <DialogTitle className={dialogTitleStyle}>{`"${param.title}"`}</DialogTitle>
                    <DialogDescription className={cn(dialogTitleStyle, 'mb-2')}>{param.description}</DialogDescription>
                    <ToolParameterInput param={param} options={param.options || []} savedState={savedState} setState={setState} />
                  </div>
                )
              })}
              {/* Tool arguments (read-only) */}
              {(selectedFunction || savedState?.id) &&
                <>
                  {/* Schema to use for tool */}
                  <div
                    className="mb-2 flex w-full flex-col items-center gap-2"
                  >
                    <DialogTitle className={dialogTitleStyle}>Schema</DialogTitle>
                    <DialogDescription className={cn(dialogTitleStyle, 'mb-2')}>
                      This schema shows the Ai how to structure its response.
                    </DialogDescription>
                    <textarea
                      name="example-ai-response"
                      value={JSON.stringify(savedState?.params_schema || state?.params_schema || {}, null, 2)}
                      placeholder="{}"
                      disabled
                      className={textareaStyle}
                    />
                  </div>
                  {/* Example parameters schema */}
                  <div
                    className="mb-2 flex w-full flex-col items-center gap-2"
                  >
                    <DialogTitle className={dialogTitleStyle}>Example Schema</DialogTitle>
                    <DialogDescription className={cn(dialogTitleStyle, 'mb-2')}>
                      An example of what arguments the tool expects.
                    </DialogDescription>
                    <textarea
                      name="example-tool-input"
                      value={JSON.stringify(savedState?.params_example || state?.params_example || {}, null, 2)}
                      placeholder="{}"
                      disabled
                      className={textareaStyle}
                    />
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
