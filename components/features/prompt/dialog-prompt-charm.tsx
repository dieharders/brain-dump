'use client'

import { useState } from 'react'
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

interface I_Props {
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  onSubmit: (charm: I_Charm) => void
}

export const PromptTemplateCharmMenu = (props: I_Props) => {
  const { dialogOpen, setDialogOpen } = props
  const [accuracy, setAccuracy] = useState([0.2])
  const defaultPromptTemplate = `[user]: {input} \n[assistant]: {ouput}`
  const defaultSystemPrompt = `[system]: You are a helpful Ai named Jerry`
  const [promptTemplate, setPromptTemplate] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const infoClass = "flex w-full flex-row gap-2"
  const inputContainerClass = "grid w-full gap-1"

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
        value={systemPrompt}
        placeholder={defaultSystemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
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
        value={promptTemplate}
        placeholder={defaultPromptTemplate}
        onChange={(e) => setPromptTemplate(e.target.value)}
      />

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
        {/* Temperature (temperature) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Temperature</Label>
            <Info label="temperature"><span><Highlight>temperature</Highlight> affects how likely the Ai is to hallucinate facts.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={0.2}
            min={0}
            max={2}
            step={0.1}
            placeholder="0.2"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Sampling Precision (top_k) */}
        <div className={inputContainerClass}>
          <div className={infoClass}>
            <Label className="text-sm font-semibold">Num K Samples</Label>
            <Info label="top_k"><span><Highlight>top_k</Highlight> limits how many options to consider when sampling.</span></Info>
          </div>
          <Input
            name="url"
            type="number"
            // value={40}
            min={0}
            step={1}
            placeholder="40"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Sampling Precision (top_p) */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Num P Samples</Label>
          <Input
            name="url"
            type="number"
            // value={0.95}
            min={0}
            step={0.01}
            placeholder="0.95"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Stop Words (stop) */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Stop Words</Label>
          <Input
            name="url"
            // value={"\n"}
            placeholder="stop"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Max Number of Tokens (max_tokens) */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Max Response Tokens</Label>
          <Input
            name="url"
            type="number"
            // value={256}
            min={4}
            step={1}
            placeholder="256"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Repetition penalty (repeat_penalty) */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Repetition Bias</Label>
          <Input
            name="url"
            type="number"
            // value={1.1}
            min={0}
            step={0.1}
            placeholder="1.1"
            className="w-full"
            onChange={() => { }}
          />
        </div>
        {/* Enable Streaming (stream) */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Stream Response</Label>
          <Switch className="block" defaultChecked />
        </div>
        {/* Echo Prompt in Response (echo) - Only for regular Completions */}
        <div className={inputContainerClass}>
          <Label className="text-sm font-semibold">Echo Prompt</Label>
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
        <Tabs label="Prompt Settings" tabs={tabs} />
      </DialogContent>
    </Dialog >
  )
}