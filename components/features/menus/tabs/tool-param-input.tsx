'use client'

import { I_SelItemData, MultiSelector } from '@/components/ui/multi-toggle'
import { I_Tool_Definition, I_Tool_Parameter } from '@/lib/homebrew'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
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

interface I_TemplateData {
  name: string
  value: string
  isLabel?: boolean
  text?: string
}

const RetrievalTemplateSelector = ({ param, setState }: I_BuiltInProps) => {
  const { services } = useGlobalContext()
  const [templates, setTemplates] = useState<I_TemplateData[]>([])
  const items = templates?.map?.(t => ({ name: t.name, value: t.value, isLabel: t.isLabel })) || []
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedTemplateName, setSelectedTemplateName] = useState(param.value)

  useEffect(
    () => {
      const action = async () => {
        const res = await services?.textInference.getRagPromptTemplates()
        const data = res?.data
        const entries: any[] = Object.entries(data)
        const result: any[] = []
        entries.forEach(i => {
          result.push({ name: i?.[0].toUpperCase(), isLabel: true })
          i[1]?.forEach((v: any) => result.push({ name: v.name, value: v.id, text: v.text }))
        })
        if (res?.success && data) setTemplates(result)
      }
      action()
    },
    [services?.textInference],
  )

  return (
    <div className="mb-2 flex w-full flex-col items-center gap-2">
      <Select
        id="param_retrieval_template"
        placeholder="Select retrieval template"
        name="param_retrieval_template"
        value={selectedTemplateName}
        items={items}
        onChange={e => {
          if (e) {
            e && setSelectedTemplateName(e)
            const templateString = templates?.find(t => t.value === e)?.text
            e && templateString && setSelectedTemplate(templateString)
            // Record final value
            setState(param.name, templateString)
          }
        }}
      />
      <textarea
        name={`${param.name}-param-text`}
        value={param.value || selectedTemplate}
        disabled
        className={textareaStyle}
      />
    </div>
  )
}

const KnowledgeSelector = ({ param, setState, savedState }: I_BuiltInProps) => {
  const { fetchCollections } = useMemoryActions()
  const [options, setOptions] = useState<any[]>([])

  const data = options?.map?.((i: I_SelItemData | string) => {
    if (typeof i === 'string') return { id: i, name: i }
    return i
  })

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
      onSubmit={(val: any) => setState(param.name, val)}
      options={data.map(p => p.name)}
      className="min-h-[5rem] w-full sm:w-full"
    >
      {data.map(p => <MiniPanelCard key={p.id} name={p.name || 'No Title'} description={p.description || 'No description.'} icon={p.icon} />)}
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

  // Update quants when "model" changes
  useEffect(
    () => {
      const action = async () => {
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
      }))}
      onChange={e => {
        e && setModel(e)
      }}
    />
    <Select
      id="model_quant_select"
      placeholder="Select quantization"
      name="model_quantization"
      value={quant || undefined}
      items={quants?.map?.((i: string) => ({
        name: `${i}`,
        value: i
      }))}
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
    case 'retrieval-template':
      return <RetrievalTemplateSelector {...props} />
    case 'memories':
      return <KnowledgeSelector {...props} />
    default:
      break
  }
  return null
}

// Return a component specific to the param type
export const ToolParameterInput = ({
  param,
  options,
  savedState,
  state,
  setState,
}: {
  param: I_Tool_Parameter,
  options: string[] | number[],
  savedState: I_Tool_Definition | undefined,
  state: I_Tool_Definition,
  setState: Dispatch<SetStateAction<I_Tool_Definition>>
}) => {
  const [component, setComponent] = useState<any>()
  const initParam = savedState?.params.find(p => p.name === param.name)
  const setParamValue = useCallback((paramName: string, value: any) => {
    setState((prev: any) => {
      const newState: I_Tool_Definition = { ...prev }
      const input = newState.params?.find(p => p.name === paramName)
      if (input) input['value'] = value
      return newState
    })
  }, [setState])

  useEffect(() => {
    let input_type

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
      setComponent(<BuiltInComponent param={param} savedState={initParam} setState={setParamValue} />)
      return
    }

    // User generated tool function inputs
    switch (param.input_type) {
      case 'options-sel': {
        setComponent(
          <Select
            id={`${param.name}_param_select`}
            placeholder={param.placeholder || ''}
            name={param.name}
            value={initParam?.value || param.default_value || undefined}
            items={options?.map?.(i => ({
              name: `${i}`,
              value: `${i}`
            }))}
            onChange={e => e && setParamValue(param.name, e)}
          />
        )
        break
      }
      // Select multiple items at once
      case 'options-multi': {
        setComponent(
          <MultiSelector
            initValue={initParam?.value}
            onSubmit={(val: any) => setParamValue(param.name, val)}
            options={options.map(p => `${p}`)}
            className="min-h-[5rem] w-full sm:w-full"
          >
            {options.map(p => <MiniPanelCard key={p} name={`${p}`} description="No description." />)}
          </MultiSelector>
        )
        break
      }
      case 'options-button':
        // @TODO Implement
        setComponent(<></>)
        break
      case 'text-multi': {
        setComponent(
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
        break
      }
      case 'text':
        setComponent(
          <Input
            name={param.name}
            defaultValue={initParam?.value}
            placeholder={param.placeholder || ''}
            type={input_type}
            min={param.min_value}
            max={param.max_value}
            onChange={e => setParamValue(param.name, e.target.value)}
            className="text-md"
          />
        )
        break
      default:
        setComponent(<></>)
    }
  }, [initParam, options, param, setParamValue])

  return component
}
