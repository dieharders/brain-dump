/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type T_FileMedia = {
  id: string
  title: string
  size?: string
  type?: 'document' | 'image' | 'audio' | 'other'
}

export interface Brain extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  documents: T_FileMedia[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
