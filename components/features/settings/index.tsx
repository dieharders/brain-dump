'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useSettings } from '@/components/features/settings/hooks'

export function Settings() {
  const {
    provider,
    setProvider,
    aiToken,
    setAIToken,
    chatDBToken,
    setChatDBToken,
    documentDBToken,
    setDocumentDBToken,
    model,
    setModel,
    clearData,
  } = useSettings()
  // AI Model input
  const [modelDialog, setModelDialog] = useState(false)
  const [aiTokenInput, setAITokenInput] = useState(aiToken ?? '')
  const renderOpenAIOptions = useCallback(
    () => (
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setModel('gpt-3.5-turbo')}>
          GPT-3.5-turbo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('gpt-4')}>GPT-4</DropdownMenuItem>
      </DropdownMenuContent>
    ),
    [setModel],
  )
  const renderHuggingfaceOptions = useCallback(
    () => (
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => setModel('OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5')}
        >
          OpenAssistant
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('gpt2')}>GPT-2</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('facebook/blenderbot-1B-distill')}>
          BlenderBot
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('tiiuae/falcon-7b-instruct')}>
          Falcon-7b
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('openlm-research/open_llama_3b_v2')}>
          Open-Llama-3b-v2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setModel('meta-llama/Llama-2-70b-chat-hf')}>
          Llama-2-70b-chat-hf (local)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setModel('TheBloke/vicuna-13B-1.1-GPTQ-4bit-128g')}
        >
          Vicuna (local)
        </DropdownMenuItem>
      </DropdownMenuContent>
    ),
    [setModel],
  )
  const renderModeloptions = useCallback(() => {
    switch (provider) {
      case 'openai':
        return renderOpenAIOptions()
      case 'huggingface':
        return renderHuggingfaceOptions()
      default:
        return null
    }
  }, [provider, renderHuggingfaceOptions, renderOpenAIOptions])
  // Chat backend input
  const [chatDBDialog, setChatDBDialog] = useState(false)
  const [chatDBInput, setChatDBInput] = useState(chatDBToken ?? '')
  // Uploads backend input
  const [documentDBDialog, setDocumentDBDialog] = useState(false)
  const [documentDBInput, setDocumentDBInput] = useState(documentDBToken ?? '')

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
            <DropdownMenuItem onClick={() => setProvider('local')}>
              Local
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
          {renderModeloptions()}
        </DropdownMenu>
        <Dialog open={modelDialog} onOpenChange={setModelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter your API key</DialogTitle>
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
              value={aiTokenInput}
              placeholder="OpenAI API key"
              onChange={e => setAITokenInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setAIToken(aiTokenInput)
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
              value={chatDBInput}
              placeholder="Vercel KV API key"
              onChange={e => setChatDBInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setChatDBToken(chatDBInput)
                  setChatDBDialog(false)
                }}
              >
                Save Token
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={() => setDocumentDBDialog(true)}>Configure Uploads</Button>
        <Dialog open={documentDBDialog} onOpenChange={setDocumentDBDialog}>
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
              value={documentDBInput}
              placeholder="Supabase API key"
              onChange={e => setDocumentDBInput(e.target.value)}
            />
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setDocumentDBToken(documentDBInput)
                  setDocumentDBDialog(false)
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
          className="bg-red-600 text-red-50 hover:bg-white hover:text-red-700"
          onClick={clearData}
        >
          Clear All Config Data
        </Button>
      </div>
      {/* Exit button */}
      <Link href="/" rel="noopener noreferrer" className="self-end px-2">
        <Button>Done</Button>
      </Link>
    </div>
  )
}
