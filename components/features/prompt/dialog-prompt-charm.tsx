'use client'

import { I_Charm } from '@/components/features/prompt/prompt-charm-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ToggleGroup from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChartIcon, AccessibilityIcon, ImageIcon, } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm) => void
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen } = props

  const presetsMenu = (
    <>
      {/* Accuracy Presets */}
      <DialogHeader className="my-8">
        <DialogTitle>Prompt Template Settings</DialogTitle>
        <DialogDescription>
          Choose an accuracy that matches your desired response (Scientific, Normal, Creative).
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full">
        <ToggleGroup label="Accuracy">
          {/* Scientific */}
          <BarChartIcon className="h-10 w-10 rounded-sm bg-background p-2" />
          {/* Normal */}
          <AccessibilityIcon className="h-10 w-10 rounded-sm bg-background p-2" />
          {/* Creative */}
          <ImageIcon className="h-10 w-10 rounded-sm bg-background p-2" />
        </ToggleGroup>
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
            placeholder="0.2"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Sampling Precision (top_k) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Num K Samples</Label>
          <Input
            name="url"
            type="number"
            // value={40}
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
            placeholder="\n"
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
        <Tabs tabs={tabs} />
      </DialogContent>
    </Dialog >
  )
}