'use client'

import { useState } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from './ui/dropdown-menu'

type Provider = 'openai' | 'anthropic' | 'tii' | 'meta' | 'huggingface'
type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4'

export interface SettingsProps {
  settings: { clientId: string }
}

export function Settings({ settings }: SettingsProps) {
  const [provider, setProvider] = useState<Provider>('openai')
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo')
  // AI Model input
  const [modelDialog, setModelDialog] = useState(false)
  const [openaiToken, setOpenaiToken] = useLocalStorage<string | null>(
    'openai-token',
    null,
  )
  const [openaiTokenInput, setOpenaiTokenInput] = useState(openaiToken ?? '')
  // Chat backend input
  const [chatDBDialog, setChatDBDialog] = useState(false)
  const [vercelKVToken, setVercelKVToken] = useLocalStorage<string | null>(
    'chat-db-token',
    null,
  )
  const [vercelKVTokenInput, setVercelKVTokenInput] = useState(vercelKVToken ?? '')
  // Uploads backend input
  const [vectorDBDialog, setVectorDBDialog] = useState(false)
  const [supabaseToken, setSupabaseToken] = useLocalStorage<string | null>(
    'vector-db-token',
    null,
  )
  const [supabaseTokenInput, setSupabaseTokenInput] = useState(supabaseToken ?? '')

  return (
    <div className="mx-auto flex w-96 flex-col justify-center gap-16 p-4">
      <div className="flex flex-col gap-8">
        <h1 className="text-center text-3xl font-bold">Configuration</h1>
        <h2 className="text-md text-center text-muted-foreground">
          Enter your credentials here. This is only needed if you intend to manage your
          infrastructure yourself.
        </h2>
      </div>
      {/* Model Config */}
      <div className="flex flex-col gap-4">
        <p className="text-center">AI</p>
        <hr className="h-4 border-neutral-500"></hr>
        <DropdownMenu>
          <DropdownMenuLabel className="text-muted-foreground">
            Select a provider
          </DropdownMenuLabel>
          <DropdownMenuTrigger asChild>
            <Button>{provider}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setProvider('openai')}>
              OpenAI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProvider('anthropic')}>
              Anthropic
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProvider('tii')}>
              TII (local)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProvider('meta')}>
              Meta (local)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setProvider('huggingface')}>
              Hugging Face
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuLabel className="text-muted-foreground">
            Choose LLM model
          </DropdownMenuLabel>
          <DropdownMenuTrigger asChild>
            <Button>{model}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setModel('gpt-3.5-turbo')}>
              GPT-3.5-turbo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setModel('gpt-4')}>GPT-4</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={modelDialog} onOpenChange={setModelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter your OpenAI key</DialogTitle>
              <DialogDescription>
                If you have not obtained your OpenAI API key, you can do so by{' '}
                <a href="https://platform.openai.com/signup/" className="underline">
                  signing up
                </a>{' '}
                on the OpenAI website. The token will be saved to your browser&apos;s
                local storage under the name{' '}
                <code className="font-mono">openai-token</code>.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={openaiTokenInput}
              placeholder="OpenAI API key"
              onChange={e => setOpenaiTokenInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setOpenaiToken(openaiToken)
                  setModelDialog(false)
                }}
              >
                Save Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => setModelDialog(true)}>Enter API Key</Button>
      </div>
      {/* Backend Config */}
      <div className="flex flex-col gap-4">
        <p className="text-center">Database</p>
        <hr className="h-4 border-neutral-500"></hr>
        <Button onClick={() => setChatDBDialog(true)}>Configure Chat</Button>
        <Dialog open={chatDBDialog} onOpenChange={setChatDBDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter your chat database key</DialogTitle>
              <DialogDescription>
                This database is responsible for Chat History, rate limiting, and session
                storage. If you have not obtained your Vercel KV API key, you can do so by{' '}
                <a href="https://platform.openai.com/signup/" className="underline">
                  signing up
                </a>{' '}
                on Vercel&apos;s website. The token will be saved to your browser&apos;s
                local storage under the name{' '}
                <code className="font-mono">chat-db-token</code>.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={vercelKVTokenInput}
              placeholder="Vercel KV API key"
              onChange={e => setVercelKVTokenInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setVercelKVToken(vercelKVToken)
                  setChatDBDialog(false)
                }}
              >
                Save Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => setVectorDBDialog(true)}>Configure Uploads</Button>
        <Dialog open={vectorDBDialog} onOpenChange={setVectorDBDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter your uploads database key</DialogTitle>
              <DialogDescription>
                This database is responsible for uploaded documents storage. If you have
                not obtained your Supabase API key, you can do so by{' '}
                <a href="https://supabase.com/" className="underline">
                  signing up
                </a>{' '}
                on Supabase&apos;s website. The token will be saved to your browser&apos;s
                local storage under the name{' '}
                <code className="font-mono">vector-db-token</code>.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={supabaseTokenInput}
              placeholder="Supabase API key"
              onChange={e => setSupabaseTokenInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setSupabaseToken(supabaseToken)
                  setVectorDBDialog(false)
                }}
              >
                Save Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Data Removal */}
      <div className="flex flex-col gap-4">
        <p className="text-center">Privacy</p>
        <hr className="h-4 border-neutral-500"></hr>
        <Button
          className="bg-red-600 text-red-50 hover:bg-white hover:text-black"
          onClick={() => {}}
        >
          Clear All Config Data
        </Button>
      </div>
      {/* Exit button */}
      <Button className="self-end" onClick={() => {}}>
        <Link href="/" rel="noopener noreferrer" className="px-2">
          Done
        </Link>
      </Button>
    </div>
  )
}
