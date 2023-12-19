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
import { QuestionMarkIcon, PersonIcon, LightningBoltIcon, } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm) => void
}

export const ResponseCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen } = props

  const presetsMenu = (
    <>
      <DialogHeader className="my-8">
        <DialogTitle>Q&A, Conversational, Assistant</DialogTitle>
        <DialogDescription className="mb-4">
          Choose how you want the Ai to behave when responding.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full">
        <ToggleGroup label="Response Type">
          {/* Q and A */}
          <QuestionMarkIcon className="h-10 w-10 rounded-sm bg-background p-2" />
          {/* Conversational */}
          <LightningBoltIcon className="h-10 w-10 rounded-sm bg-background p-2" />
          {/* Assistant */}
          <PersonIcon className="h-10 w-10 rounded-sm bg-background p-2" />
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
        {/* Context Window (n_ctx) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Context Size</Label>
          <Input
            name="url"
            type="number"
            // value={512}
            placeholder="512"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Seed */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Seed</Label>
          <Input
            name="url"
            type="number"
            // value={1337}
            placeholder="1337"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Number of threads (n_threads) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold"># Threads</Label>
          <Input
            name="url"
            type="number"
            // value={-1}
            placeholder="-1"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Max Batch Number (n_batch) - Maximum number of prompt tokens to batch together when calling llama_eval */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Batch Token Size</Label>
          <Input
            name="url"
            type="number"
            // value={512}
            placeholder="512"
            className="w-fit"
            onChange={() => { }}
          />
        </div>
        {/* Toggle precision (f16_kv) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Half-Precision</Label>
          <Switch className="block" defaultChecked />
        </div>
        {/* Memory Lock (use_mlock) */}
        <div className="grid w-full gap-1">
          <Label className="text-sm font-semibold">Memory Lock</Label>
          <Switch className="block" defaultChecked />
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
        <Tabs label="Response Settings" tabs={tabs} />
      </DialogContent>
    </Dialog>
  )
}