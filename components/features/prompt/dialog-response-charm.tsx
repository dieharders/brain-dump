'use client'

import { I_Charm } from '@/components/features/prompt/prompt-charm-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ToggleGroup from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Highlight, Info } from '@/components/ui/info'

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm) => void
}

export const ResponseCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen } = props
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"

  const presetsMenu = (
    <>
      <DialogHeader className="my-8">
        <DialogTitle>Response Types</DialogTitle>
        <DialogDescription className="mb-4">
          Choose how you want the Ai to behave when responding.
        </DialogDescription>
      </DialogHeader>

      {/* Content */}
      <div className="w-full">
        <ToggleGroup label="Response Type" defaultValue="1">
          {/* Q and A */}
          <>
            <QuestionMarkIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Question & Answer</span>
          </>
          {/* Conversational */}
          <>
            <IconConversationType className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Conversational</span>
          </>
          {/* Assistant */}
          <>
            <PersonIcon className="h-10 w-10 self-center rounded-sm bg-background p-2" />
            <span className="flex-1 self-center text-ellipsis">Assistant</span>
          </>
        </ToggleGroup>
      </div>

      <Separator className="my-6" />

      <DialogFooter className="items-center">
        <Button onClick={async () => {
          setDialogOpen(false)
        }}>Save</Button>
      </DialogFooter>
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
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Context Size</Label>
            <Info label="n_ctx"><span><Highlight>n_ctx</Highlight> determines the number of tokens to consider when generating a response.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={512}
            min={64}
            step={1}
            placeholder="512"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Seed */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Seed</Label>
            <Info label="seed"><span><Highlight>seed</Highlight> determines the randomness seed. 0 for different seed on every prompt.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={1337}
            min={0}
            step={1}
            placeholder="1337"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Number of threads (n_threads) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold"># Threads</Label>
            <Info label="n_threads"><span><Highlight>n_threads</Highlight> number of GPU threads to use when generating. If None, the number is automatically determined.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={-1}
            min={-1}
            step={1}
            placeholder="-1"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Max Batch Number (n_batch) - Maximum number of prompt tokens to batch together when calling llama_eval */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Batch Token Size</Label>
            <Info label="n_batch"><span><Highlight>n_batch</Highlight> Maximum number of prompt tokens to batch together when generating.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={512}
            min={64}
            step={1}
            placeholder="512"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Toggle precision (f16_kv) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Half-Precision</Label>
            <Info label="f16_kv"><span><Highlight>f16_kv</Highlight> Use half-precision for key/value generation cache.</span></Info>
          </div>
          <Switch className="block" defaultChecked />
        </div>
        {/* Memory Lock (use_mlock) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Memory Lock</Label>
            <Info label="use_mlock"><span><Highlight>use_mlock</Highlight> forces the system to keep the model in RAM.</span></Info>
          </div>
          <Switch className="block" />
        </div>
      </form>

      <Separator className="my-6" />

      <DialogFooter className="items-center">
        <Button onClick={async () => {
          setDialogOpen(false)
        }}>Save</Button>
      </DialogFooter>
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