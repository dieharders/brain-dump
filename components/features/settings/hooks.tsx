import { useCallback } from 'react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

type Provider = 'openai' | 'anthropic' | 'tii' | 'meta' | 'huggingface'
type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4'
type HuggingFaceModel =
  | 'facebook/blenderbot-1B-distill'
  | 'TheBloke/vicuna-13B-1.1-GPTQ-4bit-128g'
  | 'VMware/open-llama-0.7T-7B-open-instruct-v1.1'
  | 'meta-llama/Llama-2-70b-chat-hf'
  | 'gpt2'
  | 'tiiuae/falcon-7b-instruct'
  | 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
type DefaultMsg = 'no model selected'
type AIModels = OpenAIModel | HuggingFaceModel | DefaultMsg

export function useSettings() {
  const [provider, setProvider] = useLocalStorage<Provider>('llm-provider', 'openai')
  // AI Model
  const [model, setModel] = useLocalStorage<AIModels>('llm-model', 'no model selected')
  const [openaiToken, setOpenaiToken] = useLocalStorage<string | null>(
    'openai-token',
    null,
  )
  const [anthropicToken, setAnthropicToken] = useLocalStorage<string | null>(
    'anthropic-token',
    null,
  )
  const [tiiToken, setTIIToken] = useLocalStorage<string | null>('tii-token', null)
  const [metaToken, setMetaToken] = useLocalStorage<string | null>('meta-token', null)
  const [huggingfaceToken, setHuggingfaceToken] = useLocalStorage<string | null>(
    'huggingface-token',
    null,
  )
  const aiTokens = {
    openai: openaiToken,
    anthropic: anthropicToken,
    tii: tiiToken,
    meta: metaToken,
    huggingface: huggingfaceToken,
  }

  const setAIToken = useCallback(
    (value: string) => {
      switch (provider) {
        case 'openai':
          return setOpenaiToken(value)
        case 'huggingface':
          return setHuggingfaceToken(value)
        case 'anthropic':
          return setAnthropicToken(value)
        case 'meta':
          return setMetaToken(value)
        case 'tii':
          return setTIIToken(value)
        default:
          return null
      }
    },
    [
      provider,
      setAnthropicToken,
      setHuggingfaceToken,
      setMetaToken,
      setOpenaiToken,
      setTIIToken,
    ],
  )

  const aiToken = aiTokens[provider]
  // Chat backend
  const [chatDBToken, setChatDBToken] = useLocalStorage<string | null>(
    'chat-db-token',
    null,
  )
  // Uploads backend
  const [documentDBToken, setDocumentDBToken] = useLocalStorage<string | null>(
    'document-db-token',
    null,
  )
  // Data Privacy
  const clearData = () => {
    window.localStorage.removeItem('openai-token')
    window.localStorage.removeItem('huggingface-token')
    window.localStorage.removeItem('anthropic-token')
    window.localStorage.removeItem('meta-token')
    window.localStorage.removeItem('tii-token')
    window.localStorage.removeItem('llm-model')
    window.localStorage.removeItem('chat-db-token')
    window.localStorage.removeItem('document-db-token')
  }

  return {
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
  }
}
