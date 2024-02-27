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
import ToggleGroup from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconConversationType } from '@/components/ui/icons'
import { PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Highlight, Info } from '@/components/ui/info'
import { I_LLM_Options } from '@/lib/hooks/types'
import { I_LLM_Init_Options, T_ModelConfig } from '@/lib/homebrew'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm, saveSettings: I_LLM_Options) => void
  settings: I_LLM_Init_Options | null
  modelConfig: T_ModelConfig | undefined
}
// State values
export const defaultState: I_LLM_Init_Options = {
  // preset: DEFAULT_CONVERSATION_MODE,
  n_ctx: 2000,
  seed: 1337,
  n_threads: -1,
  n_batch: 512,
  offload_kqv: false,
  n_gpu_layers: 0,
  f16_kv: true,
  use_mlock: false,
}

export const ResponseCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen, onSubmit, settings, modelConfig } = props
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"
  const toggleGroupClass = "flex flex-row gap-2 rounded p-2"
  // const defaultContextWindow = modelConfig?.context_window
  const max_gpu_layers = modelConfig?.num_gpu_layers

  const [state, setState] = useState<I_LLM_Init_Options>({
    // preset: defaultState.preset,
    n_ctx: defaultState.n_ctx,
    seed: defaultState.seed,
    n_threads: defaultState.n_threads,
    n_batch: defaultState.n_batch,
    offload_kqv: defaultState.offload_kqv,
    n_gpu_layers: defaultState.n_gpu_layers,
    f16_kv: defaultState.f16_kv,
    use_mlock: defaultState.use_mlock,
  })

  // Handle input state changes
  const handleFloatChange = (propName: string, value: string) => setState(prev => {
    const defState = defaultState[propName as keyof I_LLM_Init_Options]
    const propValue = value === '' ? defState : parseFloat(value)
    return { ...prev, [propName]: propValue }
  })
  const handleStateChange = (propName: string, value: string | boolean) => setState(prev => ({ ...prev, [propName]: value }))

  const onSave = useCallback(() => {
    setDialogOpen(false)
    // Save settings
    const charm: I_Charm = { id: 'model' }
    const saveSettings = { init: {} as any }
    // Cleanup exported values to correct types
    Object.entries(state)?.forEach(([key, val]) => {
      let newVal = val
      if (typeof val === 'string') {
        if (key === 'n_batch') newVal = parseInt(val)
        if (key === 'n_ctx') newVal = parseInt(val)
        if (key === 'n_threads') newVal = parseInt(val)
        if (key === 'seed') newVal = parseInt(val)
        if (key === 'n_gpu_layers') newVal = parseInt(val)
        if (val.length === 0) newVal = undefined
      }
      // Set result
      const isZero = typeof val === 'number' && val === 0
      const shouldSet = newVal || isZero || typeof val === 'boolean'
      if (shouldSet) saveSettings.init[key] = newVal
    })
    onSubmit(charm, saveSettings)
  }, [onSubmit, setDialogOpen, state])

  // Menus
  const presetsMenu = (
    <div className="px-1">
      <DialogHeader className="my-8">
        <DialogTitle>Choose a chat mode</DialogTitle>
        <DialogDescription className="mb-4">
          {`Each model has a limited attention size. Choose how you want the Ai's attention to be handled when conversing.`}
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full">
        <ToggleGroup
          label="Chat Mode"
          value="instruct" // We will replace this anyways
          onChange={val => handleStateChange('preset', val)}
        >
          {/* Conversational - Multiple messages can be sent until the context is filled, then the conversation ends. */}
          <div id="chat" className={toggleGroupClass}>
            <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Conversational</span>
          </div>
          {/* Instruction - Maximum context is used for each query, conversation ends with each query. */}
          <div id="formatter" className={toggleGroupClass}>
            <ClipboardIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Instruction</span>
          </div>
          {/* Sliding Attention - When context fills up, move the attention window forward after each query. Conversation can continue indefinitely. */}
          <div id="agent" className={toggleGroupClass}>
            <PersonIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Rolling Chat</span>
          </div>
        </ToggleGroup>
      </div>

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
        <DialogTitle>Performance settings</DialogTitle>
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

      <Separator className="my-6" />

      <DialogFooter className="items-center">
        <Button
          className="w-full sm:w-fit"
          onClick={() => setState(defaultState)}
        >
          Reset
        </Button>
        <Button className="w-full sm:w-fit" onClick={onSave}>Save</Button>
      </DialogFooter>
    </div>
  )

  const tabs = [
    { label: 'attention', content: presetsMenu },
    { label: 'performance', content: advancedMenu },
  ]

  useEffect(() => {
    if (settings && dialogOpen) setState(prev => ({ ...prev, ...settings }))
  }, [dialogOpen, settings])

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <Tabs label="Response Settings" tabs={tabs} />
      </DialogContent>
    </Dialog>
  )
}
