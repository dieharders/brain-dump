import { useLocalStorage } from '@/lib/hooks/use-local-storage'

type Provider = 'openai' | 'anthropic' | 'tii' | 'meta' | 'huggingface'
type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-4'

export function useSettings() {
  const [provider, setProvider] = useLocalStorage<Provider>('llm-provider', 'openai')
  // AI Model
  const [model, setModel] = useLocalStorage<OpenAIModel>('llm', 'gpt-3.5-turbo')
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
  const setAIToken = (value: string) =>
    window.localStorage.setItem(provider, JSON.stringify(value))
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
  }
}
