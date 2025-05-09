'use client'

import { I_SelItemData, MultiSelector } from '@/components/ui/multi-toggle'
import { I_Tool_Definition, T_Tool_Param_Option, I_Tool_Parameter } from '@/lib/homebrew'
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { MiniPanelCard } from '@/components/features/panels/panel-card-mini'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'
import {
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const dialogTitleStyle = cn('self-justify-start self-start text-sm')
const textareaStyle = cn('text-md scrollbar min-h-[8rem] w-full rounded border-2 p-2 text-[dimgrey] outline-none focus:border-primary/50')

interface I_BuiltInProps {
  param: I_Tool_Parameter
  savedState?: I_Tool_Parameter
  setState: (paramName: string, value: any) => void
}

const KnowledgeSelector = ({ param, setState, savedState }: I_BuiltInProps) => {
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
    <MultiSelector
      initValue={savedState?.value}
      onSelect={(val: any) => setState(param.name, val)}
      options={data?.map?.(p => p.name)}
      className="min-h-[5rem] w-full sm:w-full"
    >
      {data?.map?.(p => <MiniPanelCard key={p.id} name={p.name || 'No Title'} description={p.description || 'No description.'} icon={p.icon} />)}
    </MultiSelector>
  )
}

const ModelSelector = (props: I_BuiltInProps) => {
  const { param, setState } = props
  const { services } = useGlobalContext()
  const [model, setModel] = useState<string>(param.value?.[0])
  const [models, setmodels] = useState<any[]>([])
  const [quants, setQuants] = useState<string[]>([''])
  const [quant, setQuant] = useState<string>(param.value?.[1])
  const noModelInstalled = { name: 'No models installed!', value: '' }
  const noQuantsInstalled = { name: 'No quants installed!', value: '' }

  // Update quants when "model" changes
  useEffect(
    () => {
      const action = async () => {
        // Fetch data
        const response = await services?.textInference.installed()
        const data = response?.data
        response?.success && data && setmodels(data)
        // Update quants
        const config = data?.find(mod => mod.repoId === model)
        const files: string[] = Object.keys(config?.savePath || {})
        files && setQuants(files)
        if (param.value?.[1]) setQuant(param.value?.[1])
      }
      action()
    },
    [model, param.value, services?.textInference],
  )

  return <>
    <Select
      id="model_name_select"
      placeholder="Select model"
      name="model_name"
      value={model || undefined}
      items={models?.map(e => e.repoId)?.map?.((i: string) => ({
        name: `${i}`,
        value: i
      })) || [noModelInstalled]}
      onChange={e => e && setModel(e)}
    />
    <Select
      id="model_quant_select"
      placeholder="Select quantization"
      name="model_quantization"
      value={quant || undefined}
      items={quants?.map?.((i: string) => ({
        name: `${i}`,
        value: i
      })) || [noQuantsInstalled]}
      onChange={q => {
        if (q) {
          q && setQuant(q)
          // Record final value
          const val = [model, q]
          setState(param.name, val)
        }
      }}
    />
  </>
}

const BuiltInComponent = (props: I_BuiltInProps) => {
  const { param } = props
  switch (param.options_source) {
    case 'installed-models':
      return <ModelSelector {...props} />
    case 'memories':
      return <KnowledgeSelector {...props} />
    default:
      break
  }
  return null
}

// Return a component specific to the param type
export const ToolParameterInput = (props: {
  param: I_Tool_Parameter,
  options: T_Tool_Param_Option,
  savedState: I_Tool_Definition | undefined,
  setState: Dispatch<SetStateAction<I_Tool_Definition>>
}) => {
  const {
    param,
    options,
    savedState,
    setState,
  } = props
  const selectionDescription = useRef('')
  const initParam = savedState?.params.find(p => p.name === param.name)
  const setParamValue = useCallback((paramName: string, value: any) => {
    setState((prev: any) => {
      const newState: I_Tool_Definition = { ...prev }
      const input = newState.params?.find(p => p.name === paramName)
      if (input) input['value'] = value
      return newState
    })
  }, [setState])

  // Determine type of value for input
  let input_type = ''
  switch (param.type) {
    case 'string':
      input_type = 'text'
      break
    case 'integer':
      input_type = 'number'
      break
    default:
      input_type = 'text'
      break
  }

  // Return component specific to the built-in tool function
  if (param.options_source) {
    return (<BuiltInComponent param={param} savedState={initParam} setState={setParamValue} />)
  }

  // Return user-generated inputs
  switch (param.input_type) {
    case 'options-sel': {
      const description = selectionDescription.current
      return (
        <>
          {/* Description of the currently selected param option */}
          {description ? <DialogDescription className={cn(dialogTitleStyle, 'mb-2')}>{description}</DialogDescription> : null}
          <Select
            id={`${param.name}_param_select`}
            placeholder={param.placeholder || ''}
            name={param.name}
            value={initParam?.value || undefined}
            items={options?.map?.(optionName => ({
              name: `${optionName}`,
              value: `${optionName}`
            }))}
            onChange={e => {
              const descrIndex = param.options?.findIndex(i => i === e) || 0
              selectionDescription.current = param.options_description?.[descrIndex] || ''
              e && setParamValue(param.name, e)
            }}
          />
        </>
      )
    }
    // Select multiple items at once
    case 'options-multi': {
      const description = selectionDescription.current
      return (
        <MultiSelector
          initValue={initParam?.value}
          onSelect={(val: any) => {
            const descrIndex = param.options?.findIndex(i => i === `${val}`) || 0
            selectionDescription.current = param.options_description?.[descrIndex] || ''
            setParamValue(param.name, val)
          }}
          options={options?.map?.(optionName => `${optionName}`)}
          className="min-h-[5rem] w-full sm:w-full"
        >
          {options?.map?.(optionName => <MiniPanelCard key={optionName} name={`${optionName}`} description={description || 'No description.'} />)}
        </MultiSelector>
      )
    }
    case 'options-button':
      // @TODO Implement
      return (<></>)
    case 'text-multi': {
      return (
        <div
          className="mb-2 flex w-full flex-col items-center gap-2"
        >
          <DialogTitle className={dialogTitleStyle}>{param.name}</DialogTitle>
          <DialogDescription className={cn(dialogTitleStyle, 'mb-2')}>
            {param.description}
          </DialogDescription>
          <textarea
            name="tool-param-text"
            value={initParam?.value || param.default_value || undefined}
            placeholder={param.placeholder}
            disabled
            className={textareaStyle}
          />
        </div>)
    }
    case 'text':
      return (
        <Input
          name={param.name}
          defaultValue={initParam?.value}
          placeholder={param.placeholder || ''}
          type={input_type}
          min={param.min_value}
          max={param.max_value}
          onChange={e => {
            let outputValue: any = e.target.value
            if (input_type === 'number')
              // Record correct type
              outputValue = parseInt(e.target.value)
            setParamValue(param.name, outputValue)
          }}
          className="text-md"
        />
      )
    default:
      return <></>
  }
}
