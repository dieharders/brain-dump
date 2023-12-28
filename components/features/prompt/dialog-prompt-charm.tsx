'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm, saveSettings: I_LLM_Options) => void
  settings: I_State | null
}

interface I_State extends I_LLM_Call_Options {
  // Presets
  preset?: number[] // temperature overrides preset
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, settings } = props
  const defaultPromptTemplate = `[user]: {input} \n[assistant]: {output}`
  const defaultSystemPrompt = `[system]: You are a helpful Ai named Jerry`
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"
  // State values
  const defaultState: I_State = {
    preset: [0.8],
    systemPrompt: defaultSystemPrompt,
    promptTemplate: defaultPromptTemplate,
    temperature: 0.8,
    top_k: 40,
    top_p: 0.95,
    stop: ['###'],
    max_tokens: 128,
    repeat_penalty: 1.1,
    stream: true,
    echo: false,
  }

  const [state, setState] = useState<I_State>({
    preset: defaultState.preset,
    systemPrompt: defaultState.systemPrompt,
    promptTemplate: defaultState.promptTemplate,
    temperature: defaultState.temperature,
    top_k: defaultState.top_k,
    top_p: defaultState.top_p,
    stop: defaultState.stop,
    max_tokens: defaultState.max_tokens,
    repeat_penalty: defaultState.repeat_penalty,
    stream: defaultState.stream,
    echo: defaultState.echo,
  })

  // Handle input state changes
  const handleStateChange = (propName: string, value: number[] | string | boolean) => setState(prev => ({ ...prev, [propName]: value }))
  const handleFloatChange = (propName: string, value: string) => setState(prev => {
    const defState = defaultState[propName as keyof I_State]
    const propValue = value === '' ? defState : parseFloat(value)
    return { ...prev, [propName]: propValue }
  })

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
        if (key === 'stop') newVal = val.split(' ')
        if (val.length === 0) newVal = undefined
      }
      settings.call[key] = newVal
    })
    onSubmit(charm, settings)
  }, [onSubmit, setDialogOpen, state])

  const presetsMenu = (
    <>
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
          <div className="grid w-full" onClick={() => handleStateChange('preset', [0.2])}><p className="self-end justify-self-start">🧪</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('preset', [1])}><p className="self-end justify-self-center">😐</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('preset', [1.75])}><p className="self-end justify-self-end">🎨</p></div>
        </div>
        {/* Slider */}
        <Slider
          className="px-2"
          label="Accuracy"
          step={0.1}
          max={2}
          value={state?.preset || []}
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
          Influence the overall behavior and character of the Ai (required).
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <textarea
        className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.systemPrompt}
        placeholder={defaultState.systemPrompt}
        onChange={e => handleStateChange('systemPrompt', e.target.value)}
      />

      {/* Prompt Template */}
      <DialogHeader className="my-8">
        <DialogTitle>Prompt Template</DialogTitle>
        <DialogDescription>
          Give your prompts structure. This will wrap every request (optional).
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <textarea
        className="scrollbar h-36 w-full resize-none rounded border-2 p-2 outline-none focus:border-primary/50"
        value={state?.promptTemplate}
        placeholder={defaultState.promptTemplate}
        onChange={e => handleStateChange('promptTemplate', e.target.value)}
      />

      <Separator className="my-6" />

      <DialogFooter className="items-center">
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </>
  )

  const advancedMenu = (
    <>
      {/* Advanced Settings, should override all other settings */}
      <DialogHeader className="my-8">
        <DialogTitle>Advanced Settings</DialogTitle>
        <DialogDescription>
          Overrides Accuracy presets.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <form className="grid-auto-flow grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4" method="POST" encType="multipart/form-data">
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
            value={state?.temperature}
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
            value={state?.top_k}
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
            value={state?.top_p}
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
            value={state?.stop?.join(',')}
            placeholder={defaultState.stop?.join(',')}
            className="w-full"
            onChange={event => handleStateChange('stop', event.target.value)}
          />
        </div>
        {/* Max Number of Tokens (max_tokens) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Max Response Tokens</Label>
            <Info label="max_tokens">
              <span><Highlight>max_tokens</Highlight> determines the maximum number of tokens to generate.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.max_tokens}
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
            value={state?.repeat_penalty}
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
      </form>

      <Separator className="my-6" />

      <DialogFooter className="items-center">
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </>
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
