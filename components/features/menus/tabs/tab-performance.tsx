'use client'

import { Dispatch, SetStateAction } from 'react'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Highlight, Info } from '@/components/ui/info'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { I_LLM_Init_Options, T_ModelConfig } from '@/lib/homebrew'

interface I_Props {
  state: I_LLM_Init_Options
  setState: Dispatch<SetStateAction<I_LLM_Init_Options>>
  modelConfig: T_ModelConfig | undefined
}

export const defaultState: I_LLM_Init_Options = {
  n_ctx: 0, // 0 = loaded from model
  seed: 1337,
  n_threads: -1, // -1 = all available
  n_batch: 512,
  offload_kqv: true, // cache generated responses
  n_gpu_layers: -1,
  cache_type_k: 'f16',
  cache_type_v: 'f16',
  use_mlock: true, // keep model in memory, dont swap to disk
  chat_format: undefined,
  verbose: false,
}

export const PerformanceTab = (props: I_Props) => {
  const { modelConfig, state, setState } = props
  const maxContextWindow = modelConfig?.context_window
  const max_gpu_layers = modelConfig?.num_gpu_layers
  const inputContainerClass = "grid w-full gap-2"
  const infoClass = "flex w-full flex-row items-center gap-2 max-h-[1.5rem]"
  const precisionTypes = [{ name: 'f32', value: 'f32' }, { name: 'f16 (default)', value: 'f16' }, { name: 'bf16', value: 'bf16' }, { name: 'q8_0', value: 'q8_0' }, { name: 'q4_0', value: 'q4_0' }, { name: 'q4_1', value: 'q4_1' }, { name: 'iq4_nl', value: 'iq4_nl' }, { name: 'q5_0', value: 'q5_0' }, { name: 'q5_1', value: 'q5_1' }]

  // Handle input state changes
  const handleFloatChange = (propName: string, value: string) => setState(prev => {
    const defState = defaultState[propName as keyof I_LLM_Init_Options]
    const propValue = value === '' ? defState : parseFloat(value)
    return { ...prev, [propName]: propValue }
  })

  const handleStateChange = (propName: string, value: string | boolean) => {
    setState((prev) => ({ ...prev, [propName]: value }))
  }

  return (
    <div className="px-1">
      {/* Advanced Settings, should override all other settings */}
      <DialogHeader className="my-8">
        <DialogTitle>Performance Settings</DialogTitle>
        <DialogDescription className="text-md">
          Optimize how the model performs on your hardware. Memory management, inference splitting, GPU acceleration, etc.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <form className="grid-auto-flow grid w-full grid-flow-row grid-cols-1 gap-4 sm:grid-cols-2" method="POST" encType="multipart/form-data">
        {/* Context Window (n_ctx) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Context Size</Label>
            <Info label="n_ctx">
              <span><Highlight>n_ctx</Highlight> determines the number of tokens to consider when generating a response. 0 = taken from model.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={(state?.n_ctx === 0) ? 0 : state?.n_ctx || ''}
            min={0}
            max={maxContextWindow || defaultState.n_ctx}
            step={1}
            placeholder={defaultState?.n_ctx?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('n_ctx', event.target.value)}
          />
        </div>
        {/* Seed */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Seed</Label>
            <Info label="seed">
              <span><Highlight>seed</Highlight> 0 for non-deterministic randomness for each response. Non 0 for deterministic.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.seed}
            min={0}
            step={1}
            placeholder={defaultState?.seed?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('seed', event.target.value)}
          />
        </div>
        {/* Number of threads (n_threads) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold"># Threads</Label>
            <Info label="n_threads">
              <span><Highlight>n_threads</Highlight> number of CPU threads to use when generating. If -1, value is automatically determined.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.n_threads || '0'}
            min={-1}
            step={1}
            placeholder={defaultState?.n_threads?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('n_threads', event.target.value)}
          />
        </div>
        {/* Max Batch Number (n_batch) - Maximum number of prompt tokens to batch together when calling llama_eval */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Batch Token Size</Label>
            <Info label="n_batch">
              <span><Highlight>n_batch</Highlight> Maximum number of prompt tokens to batch together when generating.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.n_batch}
            min={64}
            step={1}
            placeholder={defaultState?.n_batch?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('n_batch', event.target.value)}
          />
        </div>
        {/* Number of GPU Layers (n_gpu_layers) - Number of layers to store in VRAM. Number of layers to offload to GPU (-ngl). If -1, all layers are offloaded. */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">GPU Layers</Label>
            <Info label="n_gpu_layers">
              <span><Highlight>n_gpu_layers</Highlight> Number of layers to store in GPU VRAM. Adjust based on your hardware. -1 all layers are offloaded.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={state?.n_gpu_layers}
            min={-1}
            max={max_gpu_layers}
            step={1}
            placeholder={defaultState?.n_gpu_layers?.toString()}
            className="w-full"
            onChange={event => handleFloatChange('n_gpu_layers', event.target.value)}
          />
        </div>
        {/* Offload K, Q, V to GPU (offload_kqv) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Offload Cache</Label>
            <Info label="offload_kqv">
              <span><Highlight>offload_kqv</Highlight> Whether to offload K, Q, V to GPU.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.offload_kqv}
            onCheckedChange={val => handleStateChange('offload_kqv', val)}
          />
        </div>
        {/* Precision (cache type k) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Cache Precision (K)</Label>
            <Info label="cache_type_k">
              <span><Highlight>cache_type_k</Highlight> Specify the precision of the cache (K) for generated responses.</span>
            </Info>
          </div>
          <Select
            id="cache_type_k"
            placeholder="Choose a precision"
            name="Cache precision type (k)"
            value={state?.cache_type_k || undefined}
            items={precisionTypes}
            onChange={val => handleStateChange('cache_type_k', val)}
          />
        </div>
        {/* Memory Lock (use_mlock) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Memory Lock</Label>
            <Info label="use_mlock">
              <span><Highlight>use_mlock</Highlight> forces the system to keep the model in RAM. Faster but uses more available memory.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.use_mlock}
            onCheckedChange={val => handleStateChange('use_mlock', val)}
          />
        </div>
        {/* Precision (cache type v) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Cache Precision (V)</Label>
            <Info label="cache_type_v">
              <span><Highlight>cache_type_v</Highlight> Specify the precision of the cache (V) for generated responses.</span>
            </Info>
          </div>
          <Select
            id="cache_type_v"
            placeholder="Choose a precision"
            name="Cache precision type (v)"
            value={state?.cache_type_v || undefined}
            items={precisionTypes}
            onChange={val => handleStateChange('cache_type_v', val)}
          />
        </div>
      </form>
    </div>
  )
}
