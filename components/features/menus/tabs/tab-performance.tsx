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
import { I_LLM_Init_Options, T_ModelConfig } from '@/lib/homebrew'

interface I_Props {
  state: I_LLM_Init_Options
  setState: Dispatch<SetStateAction<I_LLM_Init_Options>>
  modelConfig: T_ModelConfig | undefined
}

export const defaultState: I_LLM_Init_Options = {
  n_ctx: 1000,
  seed: 1337,
  n_threads: -1,
  n_batch: 512,
  offload_kqv: false,
  n_gpu_layers: -1,
  f16_kv: true,
  use_mlock: false,
  verbose: false,
}

export const PerformanceTab = (props: I_Props) => {
  const { modelConfig, state, setState } = props
  const maxContextWindow = modelConfig?.context_window
  const max_gpu_layers = modelConfig?.num_gpu_layers
  const inputContainerClass = "grid w-full gap-1"
  const infoClass = "flex w-full flex-row gap-2"

  // @TODO Maybe need to implement this with setState
  // const saveParsedSettings = useCallback((settings: { [key: string]: any }) => {
  //   const saveSettings: { [key: string]: any } = {}
  //   // Cleanup exported values to correct types
  //   Object.entries(settings)?.forEach(([key, val]) => {
  //     let newVal = val
  //     if (typeof val === 'string') {
  //       if (key === 'n_batch') newVal = parseInt(val)
  //       if (key === 'n_ctx') newVal = parseInt(val)
  //       if (key === 'n_threads') newVal = parseInt(val)
  //       if (key === 'seed') newVal = parseInt(val)
  //       if (key === 'n_gpu_layers') newVal = parseInt(val)
  //       if (val.length === 0) newVal = undefined
  //     }
  //     // Set result
  //     const isZero = typeof val === 'number' && val === 0
  //     const shouldSet = newVal || isZero || typeof val === 'boolean'
  //     if (shouldSet) saveSettings[key] = newVal
  //   })
  //   setState(saveSettings)
  // }, [setState])

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
        <DialogDescription>
          Customize how the model performs on your hardware. Configure memory management, inference splitting across CPU cores and/or enable acceleration on a dedicated GPU.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <form className="grid-auto-flow grid w-full grid-flow-row auto-rows-max grid-cols-2 gap-4" method="POST" encType="multipart/form-data">
        {/* Context Window (n_ctx) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Context Size</Label>
            <Info label="n_ctx">
              <span><Highlight>n_ctx</Highlight> determines the number of tokens to consider when generating a response.</span>
            </Info>
          </div>
          <Input
            name="url"
            type="number"
            value={(state?.n_ctx === 0) ? 0 : state?.n_ctx || ''}
            min={64}
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
        {/* Precision (f16_kv) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Half-Precision</Label>
            <Info label="f16_kv">
              <span><Highlight>f16_kv</Highlight> Use half-precision for key/value generation cache.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.f16_kv}
            onCheckedChange={val => handleStateChange('f16_kv', val)}
          />
        </div>
        {/* Memory Lock (use_mlock) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Memory Lock</Label>
            <Info label="use_mlock">
              <span><Highlight>use_mlock</Highlight> forces the system to keep the model in RAM.</span>
            </Info>
          </div>
          <Switch
            className="block"
            checked={state?.use_mlock}
            onCheckedChange={val => handleStateChange('use_mlock', val)}
          />
        </div>
      </form>
    </div>
  )
}
