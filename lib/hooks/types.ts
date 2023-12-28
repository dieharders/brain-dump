import { type Message } from 'ai/react'
import { ModelID } from '@/components/features/settings/types'

export interface I_InferenceGenerateOptions extends I_LLM_Call_Options {
  mode?: 'completion' | 'chat'
}

export interface I_LLM_Init_Options {
  n_gpu_layers?: number
  use_mlock?: boolean
  seed?: number
  n_ctx?: number
  n_batch?: number
  n_threads?: number
  offload_kqv?: boolean
  chat_format?: string
  f16_kv?: boolean
}

export interface I_LLM_Call_Options {
  prompt?: string
  messages?: Message[]
  suffix?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  min_p?: number
  echo?: boolean
  stop?: string[]
  repeat_penalty?: number
  presence_penalty?: number // 1.0
  frequency_penalty?: number // 1.0
  top_k?: number
  stream?: boolean
  seed?: number
  tfs_z?: number
  mirostat_tau?: number
  model?: ModelID
  promptTemplate?: string
  systemPrompt?: string
  // grammar?: string
}

export interface I_LLM_Options {
  init?: I_LLM_Init_Options
  call?: I_LLM_Call_Options
}
