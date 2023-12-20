'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm) => void
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen } = props
  const [accuracy, setAccuracy] = useState([0.2])

  const presetsMenu = (
    <>
      {/* Accuracy Presets */}
      <DialogHeader className="my-8">
        <DialogTitle>Prompt Template Settings</DialogTitle>
        <DialogDescription>
          Choose an accuracy that matches your desired response.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="flex w-full flex-col">
        {/* Icons */}
        <div className="flex w-full cursor-pointer select-none flex-row justify-center justify-items-stretch text-3xl">
          <div className="grid w-full" onClick={() => setAccuracy([0.2])}><p className="self-end justify-self-start">🧪</p></div>
          <div className="grid w-full" onClick={() => setAccuracy([1])}><p className="self-end justify-self-center">😐</p></div>
          <div className="grid w-full" onClick={() => setAccuracy([1.75])}><p className="self-end justify-self-end">🎨</p></div>
        </div>
        {/* Slider */}
        <Slider className="px-2" label="Accuracy" step={0.1} max={2} value={accuracy} setState={setAccuracy} />
        {/* Labels */}
        <div className="flex w-full select-none flex-row justify-center justify-items-stretch text-sm">
          <div className="grid w-full"><p className="self-end justify-self-start">Scientific</p></div>
          <div className="grid w-full"><p className="self-end justify-self-center">Normal</p></div>
          <div className="grid w-full"><p className="self-end justify-self-end">Creative</p></div>
        </div>
      </div>

      <Separator className="my-6" />

      <Button onClick={async () => { }}>Save</Button>
    </>
  )

  const advancedMenu = (
    <>
      {/* Advanced Settings, should override all other settings */}
      <DialogHeader className="my-8">
        <DialogTitle>Advanced Settings</DialogTitle>
        <DialogDescription>
          Override presets.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <form className="grid-auto-flow grid w-fit grid-flow-row auto-rows-max grid-cols-2 gap-4" method="POST" encType="multipart/form-data">
        {/* Temperature (temperature) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Temperature</Label>
          <Input
            name="url"
            type="number"
            // value={0.2}
            min={0}
            max={2}
            step={0.1}
            placeholder="0.2"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Sampling Precision (top_k) - limit how many options we consider while sampling */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Num K Samples</Label>
          <Input
            name="url"
            type="number"
            // value={40}
            min={0}
            step={1}
            placeholder="40"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Sampling Precision (top_p) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Num P Samples</Label>
          <Input
            name="url"
            type="number"
            // value={0.95}
            min={0}
            step={0.01}
            placeholder="0.95"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Stop Words (stop) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Stop Words</Label>
          <Input
            name="url"
            // value={"\n"}
            placeholder="stop"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Max Number of Tokens (max_tokens) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Max Response Tokens</Label>
          <Input
            name="url"
            type="number"
            // value={256}
            min={4}
            step={1}
            placeholder="256"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Repetition penalty (repeat_penalty) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Repetition Bias</Label>
          <Input
            name="url"
            type="number"
            // value={1.1}
            min={0}
            step={0.1}
            placeholder="1.1"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Enable Streaming (stream) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Stream Response</Label>
          <Switch className="block" defaultChecked />
        </div>
        {/* Echo Prompt in Response (echo) - Only for regular Completions */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Echo Prompt</Label>
          <Switch className="block" />
        </div>
      </form>

      <Separator className="my-6" />

      <Button onClick={async () => { }}>Save</Button>
    </>
  )

  const tabs = [
    { label: 'presets', content: presetsMenu },
    { label: 'advanced', content: advancedMenu },
  ]

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <Tabs label="Prompt Settings" tabs={tabs} />
      </DialogContent>
    </Dialog >
  )
}