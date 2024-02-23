'use client'

import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Highlight, Info } from '@/components/ui/info'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'

export interface I_State {
  temperature?: number
  max_tokens?: number
  top_p?: number
  echo?: boolean
  stop?: string[]
  repeat_penalty?: number
  top_k?: number
  stream?: boolean
  // min_p?: number
  // presence_penalty?: number // 1.0
  // frequency_penalty?: number // 1.0
  // tfs_z?: number
  // mirostat_tau?: number
  // grammar?: string
}

interface I_Props {
  state: I_State
  setState: (val: I_State) => void
}

export const defaultState: I_State = {
  temperature: 0.8,
  top_k: 40,
  top_p: 0.95,
  stop: [''],
  max_tokens: 128,
  repeat_penalty: 1.1,
  stream: true,
  echo: false,
}

export const ResponseTab = (props: I_Props) => {
  const { state, setState } = props
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"
  const stopPlaceholder = '[DONE]'

  // Handle input state changes
  const handleFloatValue = (val: any) => {
    return (val === 0 || val === '') ? 0 : val || ''
  }

  const handleStateChange = (propName: string, value: number | string | boolean) => {
    setState({ ...state, [propName]: value })
  }

  const handleFloatChange = (propName: string, value: string) => {
    setState({ ...state, [propName]: parseFloat(value) })
  }

  const convertToString = (value: string[] | undefined) => {
    if (!value) return ''
    return value.join(' ')
  }

  return (
    <div className="px-1">
      {/* Accuracy Presets */}
      <DialogHeader className="my-8">
        <div className={infoClass}>
          <DialogTitle>Accuracy Settings</DialogTitle>
          <Info label="temperature">
            <span><Highlight>temperature</Highlight> {`affects how likely the Ai is to "hallucinate" facts, be creative.`}</span>
          </Info>
        </div>
        <DialogDescription>
          Choose an accuracy that matches your desired response.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="flex w-full flex-col">
        {/* Icons */}
        <div className="flex w-full cursor-pointer select-none flex-row justify-center justify-items-stretch text-3xl">
          <div className="grid w-full" onClick={() => handleStateChange('temperature', 0.2)}><p className="self-end justify-self-start">🧪</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('temperature', 1)}><p className="self-end justify-self-center">😐</p></div>
          <div className="grid w-full" onClick={() => handleStateChange('temperature', 1.75)}><p className="self-end justify-self-end">🎨</p></div>
        </div>
        {/* Slider */}
        <Slider
          className="px-2"
          label="Accuracy"
          min={0}
          step={0.1}
          max={2}
          value={state?.temperature || 0}
          setState={val => handleStateChange('temperature', val)}
        />
        {/* Labels */}
        <div className="flex w-full select-none flex-row justify-center justify-items-stretch text-sm">
          <div className="grid w-full"><p className="self-end justify-self-start">Scientific</p></div>
          <div className="grid w-full"><p className="self-end justify-self-center">Normal</p></div>
          <div className="grid w-full"><p className="self-end justify-self-end">Creative</p></div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* LLM call Settings */}
      <DialogHeader className="my-8">
        <DialogTitle>Response Settings</DialogTitle>
        <DialogDescription>
          Determine how the LLM behaves when responding to requests.
        </DialogDescription>
      </DialogHeader>

      {/* Options Content */}
      <div className="grid-auto-flow m-auto grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4">
        {/* Temperature (temperature) */}
        {/* <div className={inputContainerClass}>
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
        </div> */}
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
            value={convertToString(state?.stop)}
            placeholder={stopPlaceholder}
            className="w-full"
            onChange={event => {
              // Remove multiple consecutive spaces
              const inputVal = event.target.value.replace(/ +/g, ' ')
              const arrVal = inputVal.split(' ')
              setState({ ...state, stop: arrVal })
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
    </div>
  )
}
