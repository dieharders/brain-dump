import { useCallback, useEffect, useState } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '@/components/ui/select'
import { T_SystemPrompt, T_SystemPrompts } from '@/lib/homebrew'

type T_TemplateSource = 'custom_default' | string

interface I_State {
  systemMessage: string
}

interface I_Props {
  onSubmit: (state: any) => void
  services: any
}

export const defaultState = {
  systemMessage: 'You are an AI assistant that helps people find information.',
}

export const SystemTab = ({ onSubmit, services }: I_Props) => {
  // State values
  const [state, setState] = useState<I_State>(defaultState)
  const [systemPromptSource, setSystemPromptSource] = useState<string>()
  const [systemPrompts, setSystemPrompts] = useState<T_SystemPrompts | undefined>()

  const fetchSystemPrompts = useCallback(async () => services?.textInference.getSystemPrompts(), [services?.textInference])

  // Handle input state changes
  const handleStateChange = (propName: string, value: number | string | boolean) => {
    setState(prev => ({ ...prev, [propName]: value }))
  }

  const constructOptionsGroups = (config: { [key: string]: Array<T_SystemPrompt> }) => {
    const groups = Object.keys(config)
    return groups.map((groupName) => {
      const configs = config[groupName]
      const items = configs.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)
      return (
        <SelectGroup key={groupName}>
          <SelectLabel className="select-none">{groupName}</SelectLabel>
          {/* @TODO We should specify which templates are for "chat" or "completion" */}
          {items}
        </SelectGroup>
      )
    })
  }

  const systemPromptOptions = useCallback(() => {
    const config = systemPrompts?.presets ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Editable</SelectLabel>
        <SelectItem value="custom_default">Custom</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [systemPrompts?.presets])

  useEffect(() => {
    const action = async () => {
      await fetchSystemPrompts().then(res => res?.data && setSystemPrompts(res.data))
    }
    action()
  }, [])

  useEffect(() => {
    onSubmit(state)
  }, [state])

  return (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Construct a personality for your Ai model</DialogTitle>
        <DialogDescription className="mb-4">
          Every model comes with a pre-trained personality type. Choose from premade templates to override the model's behavior. Or write your own custom role description in the form below.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full flex flex-col justify-between items-start gap-2">
        {/* Select where to load from */}
        <div className="mb-2 w-full">
          <Select
            value={systemPromptSource}
            onValueChange={val => {
              val && setSystemPromptSource(val as T_TemplateSource)
              let template = ''
              if (val === 'custom_default') template = state?.systemMessage || ''
              else {
                const configs = systemPrompts?.presets ?? {}
                const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
                template = items.find(i => i.id === val)?.text || ''
              }
              if (template) setState(prev => ({ ...prev, systemMessage: template }))
            }}
          >
            <SelectTrigger className="w-full flex-1">
              <SelectValue placeholder="Select a source"></SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[16rem] p-1">
              {systemPromptOptions()}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <textarea
          disabled={systemPromptSource !== 'custom_default'}
          className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
          value={state?.systemMessage}
          placeholder={defaultState.systemMessage}
          onChange={e => handleStateChange('systemMessage', e.target.value)}
        />
      </div>
    </div>
  )
}