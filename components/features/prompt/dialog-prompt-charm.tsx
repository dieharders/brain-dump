'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { I_Charm } from '@/components/features/prompt/prompt-charm-menu'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Highlight, Info } from '@/components/ui/info'
import { I_LLM_Call_Options, I_LLM_Options } from '@/lib/hooks/types'
import { T_PromptTemplates, T_RAGPromptTemplate, T_SystemPrompt, T_SystemPrompts } from '@/lib/homebrew'

interface I_State extends I_LLM_Call_Options {
  // Presets
  preset?: number // preset overrides temperature
}

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm, saveSettings: I_LLM_Options) => void
  settings: I_State | null
  promptTemplates: T_PromptTemplates | undefined
  systemPrompts: T_SystemPrompts | undefined
}

type T_TemplateSource = 'custom_default' | string

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, settings, promptTemplates, systemPrompts } = props
  const defaultSystemPrompt = 'You are an AI assistant that helps people find information.'
  const defaultPromptTemplate = '{query_str}'
  const [systemPromptSource, setSystemPromptSource] = useState<string>()
  const [promptTemplateSource, setPromptTemplateSource] = useState<T_TemplateSource>()
  const [ragPromptSource, setRagPromptSource] = useState<string>() // llama-index prompts
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"

  // Default state values
  const defaultState = useMemo(() => {
    return {
      preset: 0.8,
      systemPrompt: defaultSystemPrompt,
      promptTemplate: defaultPromptTemplate,
      ragPromptTemplate: { id: 'simple_input', name: 'Basic Input', text: '{query_str}', type: 'SIMPLE_INPUT' },
      temperature: 0.8,
      top_k: 40,
      top_p: 0.95,
      stop: ['### [DONE]'],
      max_tokens: 128,
      repeat_penalty: 1.1,
      stream: true,
      echo: false,
      similarity_top_k: 1,
    }
  }, [])

  // State values
  const [state, setState] = useState<I_State>({
    preset: defaultState.preset,
    systemPrompt: defaultState.systemPrompt,
    promptTemplate: defaultState.promptTemplate,
    ragPromptTemplate: defaultState.ragPromptTemplate,
    temperature: defaultState.temperature,
    top_k: defaultState.top_k,
    top_p: defaultState.top_p,
    stop: [''],
    max_tokens: defaultState.max_tokens,
    repeat_penalty: defaultState.repeat_penalty,
    stream: defaultState.stream,
    echo: defaultState.echo,
    similarity_top_k: defaultState.similarity_top_k,
    response_mode: undefined,
  })

  const handleFloatValue = (val: any) => {
    return (val === 0 || val === '') ? 0 : val || ''
  }

  // Handle input state changes
  const handleStateChange = (propName: string, value: number | string | boolean) => {
    let presets: any
    if (propName === 'preset') {
      // Set advanced values for this preset
      presets = {
        temperature: value,
      }
    }
    setState(prev => ({ ...prev, ...presets, [propName]: value }))
  }

  const handleFloatChange = (propName: string, value: string) => {
    setState(prev => ({ ...prev, [propName]: parseFloat(value) }))
  }

  const handleStopValue = (val: string | string[] | undefined) => {
    if (Array.isArray(val)) {
      // Remove last space in string
      const ind = val.length - 1
      if (val[ind] === '') val.splice(ind, 1)

      return val.join(' ')
    }

    return val || ''
  }

  const onSave = useCallback(() => {
    setDialogOpen(false)
    // Save settings
    const charm: I_Charm = { id: 'prompt' }
    const settings = { call: {} as any }
    // Cleanup exported values to correct types
    Object.entries(state)?.forEach(([key, val]) => {
      let newVal = val
      if (typeof val === 'string') {
        if (key === 'max_tokens') newVal = parseInt(val)
        if (key === 'repeat_penalty') newVal = parseFloat(val)
        if (key === 'temperature') newVal = parseFloat(val)
        if (key === 'top_k') newVal = parseInt(val)
        if (key === 'top_p') newVal = parseFloat(val)
      }
      if (key === 'stop') {
        if (Array.isArray(val)) {
          // Never allow empty string in array, otherwise no response.
          if (newVal?.[0] === '') newVal = []
        } else {
          // Create array result from string
          newVal = val?.split?.(' ')
        }
      }
      // Set result
      const isZero = typeof val === 'number' && val === 0
      const shouldSet = newVal || isZero || typeof val === 'boolean'
      if (shouldSet) settings.call[key] = newVal
    })
    onSubmit(charm, settings)
  }, [onSubmit, setDialogOpen, state])

  const constructOptionsGroups = (config: { [key: string]: Array<T_SystemPrompt | T_RAGPromptTemplate> }) => {
    const groups = Object.keys(config)
    return groups.map((groupName) => {
      const configs = config[groupName]
      const items = configs.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)
      return (
        <SelectGroup key={groupName}>
          <SelectLabel className="select-none">{groupName}</SelectLabel>
          {/* We should specify which templates are for "chat" or "completion" */}
          {items}
        </SelectGroup>
      )
    })
  }

  const ragPromptTemplateOptions = useCallback(() => {
    const config = promptTemplates?.rag_presets ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Custom</SelectLabel>
        <SelectItem value="custom_default">Custom (Editable)</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [promptTemplates?.rag_presets])

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

  const promptTemplateOptions = useCallback(() => {
    const config = promptTemplates?.normal_presets ?? {}
    const presets = constructOptionsGroups(config)
    const customGroup = (
      <SelectGroup key="custom">
        <SelectLabel className="select-none">Editable</SelectLabel>
        <SelectItem value="custom_default">Custom</SelectItem>
      </SelectGroup>
    )
    return [customGroup, ...presets]
  }, [promptTemplates?.normal_presets])

  const getResponseModes = useCallback(() => {
    const parseString = (str: string) => {
      const words = str.split('_')
      words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      return words.join(' ')
    }
    // @TODO Get from api endpoint
    const data = ['COMPACT']
    return data.map(i => <SelectItem key={i} value={i}>{parseString(i)}</SelectItem>)
  }, [])

  const presetsMenu = (
    <div className="px-1">
      {/* Accuracy Presets */}
      <DialogHeader className="my-8">
        <DialogTitle>Accuracy Settings</DialogTitle>
        <DialogDescription>
          Choose an accuracy that matches your desired response.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="flex w-full flex-col">
        {/* Icons */}
        <div className="flex w-full cursor-pointer select-none flex-row justify-center justify-items-stretch text-3xl">
          <div className="grid w-full" onClick={() => handleStateChange('preset', 0.2)}><p className="self-end justify-self-start">🧪</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('preset', 1)}><p className="self-end justify-self-center">😐</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('preset', 1.75)}><p className="self-end justify-self-end">🎨</p></div>
        </div>
        {/* Slider */}
        <Slider
          className="px-2"
          label="Accuracy"
          min={0}
          step={0.1}
          max={2}
          value={state?.preset || 0}
          setState={val => handleStateChange('preset', val)}
        />
        {/* Labels */}
        <div className="flex w-full select-none flex-row justify-center justify-items-stretch text-sm">
          <div className="grid w-full"><p className="self-end justify-self-start">Scientific</p></div>
          <div className="grid w-full"><p className="self-end justify-self-center">Normal</p></div>
          <div className="grid w-full"><p className="self-end justify-self-end">Creative</p></div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* System Prompt */}
      <DialogHeader className="my-8">
        <DialogTitle>System Prompt</DialogTitle>
        <DialogDescription>
          Prepare the Ai by giving a description of its role and overall behavior.
        </DialogDescription>
      </DialogHeader>

      {/* Select where to load from */}
      <div className="mb-2 w-full">
        <Select
          value={systemPromptSource}
          onValueChange={val => {
            val && setSystemPromptSource(val as T_TemplateSource)
            let template = ''
            // @TODO Eventually this will be read from a "custom_system_prompts.json" file from engine
            if (val === 'custom_default') template = settings?.systemPrompt || ''
            else {
              const configs = systemPrompts?.presets ?? {}
              const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
              template = items.find(i => i.id === val)?.text || ''
            }
            template && setState(prev => ({ ...prev, systemPrompt: template }))
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
        value={state?.systemPrompt}
        placeholder={defaultState.systemPrompt}
        onChange={e => handleStateChange('systemPrompt', e.target.value)}
      />

      {/* Prompt Template (Normal chat) */}
      <DialogHeader className="my-8">
        <DialogTitle>Prompt Template</DialogTitle>
        <DialogDescription>
          Give your prompts structure. This will wrap every request.
        </DialogDescription>
      </DialogHeader>

      {/* Select where to load from */}
      <div className="mb-2 w-full">
        <Select
          value={promptTemplateSource}
          onValueChange={val => {
            val && setPromptTemplateSource(val)
            let template = ''
            if (val === 'custom_default' && settings?.promptTemplate) template = settings.promptTemplate
            else {
              const configs = promptTemplates?.normal_presets ?? {}
              const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
              const tValue = items.find(i => i.id === val)
              if (tValue) template = tValue.text
            }
            if (template) setState(prev => ({ ...prev, promptTemplate: template }))
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a source"></SelectValue>
          </SelectTrigger>
          <SelectContent className="p-1">
            {promptTemplateOptions()}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <textarea
        disabled={promptTemplateSource !== 'custom_default'}
        className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.promptTemplate}
        placeholder={defaultState.promptTemplate}
        onChange={e => handleStateChange('promptTemplate', e.target.value)}
      />

      {/* Prompt Template (Chat with Memories) */}
      <DialogHeader className="my-8">
        <DialogTitle>Memory Template</DialogTitle>
        <DialogDescription>
          When chatting with your memories, instruct & guide the Ai on how to handle your requests.
        </DialogDescription>
      </DialogHeader>

      {/* Select where to load from */}
      <div className="mb-2 w-full">
        <Select
          value={ragPromptSource}
          onValueChange={val => {
            val && setRagPromptSource(val)
            let template = {} as T_RAGPromptTemplate
            // @TODO Eventually this will be read from a "custom_prompt_templates.json" file from engine
            if (val === 'custom_default') {
              if (settings?.ragPromptTemplate) {
                template = settings.ragPromptTemplate
                template.type = 'CUSTOM' // hard-code since user has no way of inputting
              }
            }
            else {
              const configs = promptTemplates?.rag_presets ?? {}
              const items = Object.values(configs).reduce((accumulator, currentValue) => [...accumulator, ...currentValue])
              const tValue = items.find(i => i.id === val)
              if (tValue) template = tValue
            }
            if (template.text) setState(prev => ({ ...prev, ragPromptTemplate: template }))
          }}
        >
          <SelectTrigger className="w-full flex-1">
            <SelectValue placeholder="Select a source"></SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[16rem] p-1">
            {ragPromptTemplateOptions()}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <textarea
        disabled={ragPromptSource !== 'custom_default'}
        className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.ragPromptTemplate?.text}
        placeholder={defaultState.ragPromptTemplate?.text}
        onChange={
          e => {
            if (state?.ragPromptTemplate) {
              const newValue = { ...state?.ragPromptTemplate, text: e.target.value }
              setState(prev => ({ ...prev, ragPromptTemplate: newValue }))
            }
          }
        }
      />

      <Separator className="my-6" />

      <DialogFooter className="items-stretch">
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </div>
  )

  const advancedMenu = (
    <div className="px-1">
      {/* Advanced Settings, should override all other settings */}
      <DialogHeader className="my-8">
        <DialogTitle>Advanced Settings</DialogTitle>
        <DialogDescription>
          Overrides Accuracy presets.
        </DialogDescription>
      </DialogHeader>

      {/* Options Content */}
      <div className="grid-auto-flow m-auto grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4">
        {/* Temperature (temperature) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Temperature</Label>
            <Info label="temperature">
              <span><Highlight>temperature</Highlight> affects how likely the Ai is to hallucinate facts.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.temperature)}
            min={0}
            max={2}
            step={0.1}
            placeholder={defaultState?.temperature?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('temperature', event.target.value)}
          />
        </div>
        {/* Sampling Precision (top_k) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold"># Token Samples</Label>
            <Info label="top_k">
              <span><Highlight>top_k</Highlight> limits how many words to consider when generating the next word.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.top_k)}
            min={0}
            step={1}
            placeholder={defaultState?.top_k?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('top_k', event.target.value)}
          />
        </div>
        {/* Sampling Precision (top_p) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Possibility Bias</Label>
            <Info label="top_p">
              <span>Only consider the possibilities that equal or exceed <Highlight>top_p</Highlight>.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.top_p)}
            min={0}
            max={1}
            step={0.01}
            placeholder={defaultState?.top_p?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('top_p', event.target.value)}
          />
        </div>
        {/* Stop Words (stop) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Stop Words</Label>
            <Info label="stop">
              <span><Highlight>stop</Highlight> words are phrases that should be excluded from the input due to high occurance. Enter space seperated words.</span>
            </Info>
          </div>
          <Input
            name="url"
            value={handleStopValue(state?.stop)}
            placeholder={defaultState.stop?.join(' ')}
            className="w-full"
            onChange={event => {
              // Remove multiple consecutive spaces
              const inputVal = event.target.value.replace(/ +/g, ' ')
              handleStateChange('stop', inputVal)
            }}
          />
        </div>
        {/* Max Number of Tokens (max_tokens) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Max Response Tokens</Label>
            <Info label="max_tokens">
              <span><Highlight>max_tokens</Highlight> determines the maximum number of tokens to generate. 0 means auto calculate.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.max_tokens)}
            min={4}
            step={1}
            placeholder={defaultState?.max_tokens?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('max_tokens', event.target.value)}
          />
        </div>
        {/* Repetition penalty (repeat_penalty) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Repeat Bias</Label>
            <Info label="repeat_penalty">
              <span><Highlight>repeat_penalty</Highlight> prevents words from occuring too frequently.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.repeat_penalty)}
            min={0}
            step={0.1}
            placeholder={defaultState?.repeat_penalty?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('repeat_penalty', event.target.value)}
          />
        </div>
        {/* Enable Streaming (stream) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Stream Response</Label>
            <Info label="stream">
              <span>Enable <Highlight>stream</Highlight> to receive each token as it is generated instead of the entire response upon completion.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.stream}
            onCheckedChange={val => handleStateChange('stream', val)}
          />
        </div>
        {/* Echo Prompt in Response (echo) - Only for regular Completions */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Echo Prompt</Label>
            <Info label="echo">
              <span><Highlight>echo</Highlight> will repeat the prompt in the response.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.echo}
            onCheckedChange={val => handleStateChange('echo', val)}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* RAG Options ONLY */}
      <DialogHeader className="my-8">
        <DialogTitle>Memory Retrieval</DialogTitle>
        <DialogDescription>
          Only applies to queries that use external memories as context.
        </DialogDescription>
      </DialogHeader>

      {/* RAG Options Content */}
      <div className="grid-auto-flow m-auto grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4">
        {/* Max Number of Results (similarity_top_k) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Num Matching Results</Label>
            <Info label="similarity_top_k">
              <span><Highlight>similarity_top_k</Highlight> determines how many matching documents to consider when synthesizing a response.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={handleFloatValue(state?.similarity_top_k)}
            min={1}
            step={1}
            placeholder={defaultState?.similarity_top_k?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('similarity_top_k', event.target.value)}
          />
        </div>

        {/* Type of response (response_mode) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Type of Response</Label>
            <Info label="response_mode">
              <span><Highlight>response_mode</Highlight> determines how the LLM responds to the context.</span>
            </Info>
          </div>
          <div className="w-full">
            <Select
              defaultValue={undefined}
              value={state?.response_mode}
              onValueChange={value => handleStateChange('response_mode', value)}
            >
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder="Select Response Mode"></SelectValue>
              </SelectTrigger>
              <SelectGroup>
                <SelectContent className="p-1">
                  {getResponseModes()}
                </SelectContent>
              </SelectGroup>
            </Select>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <DialogFooter className="items-stretch">
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </div>
  )

  const tabs = [
    { label: 'presets', content: presetsMenu },
    { label: 'advanced', content: advancedMenu },
  ]

  useEffect(() => {
    if (settings && dialogOpen) setState(prev => ({ ...prev, ...settings }))
  }, [dialogOpen, settings])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <Tabs label="Prompt Settings" tabs={tabs} />
      </DialogContent>
    </Dialog >
  )
}
