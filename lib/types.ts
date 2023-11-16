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

export type T_Chunk = {
  id: string
  embedding: Array<[]>
  document: string
  metadata: any
}

export interface Brain extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  documents: T_Chunk[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
