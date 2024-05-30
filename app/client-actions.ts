'use client'

import { useGlobalContext } from '@/contexts'
import { I_Thread } from '@/lib/homebrew'

// Threads (from openbrew ai)
export const useThreads = () => {
  const { services } = useGlobalContext()
  const getThread = async (id: string) =>
    services?.storage.getChatThread({ queryParams: { threadId: id } })
  const getAllThreads = async () => services?.storage.getChatThread({ queryParams: {} })
  const removeChat = async (id: string) =>
    services?.storage.deleteChatThread({ queryParams: { threadId: id } })
  const clearChats = async () => services?.storage.deleteChatThread({ queryParams: {} })
  const getSharedChat = async () => {}
  const shareChat = async (_thread: I_Thread) => true
  const newThread = async () => {}

  return {
    getAllThreads,
    getThread,
    removeChat,
    clearChats,
    getSharedChat,
    shareChat,
    newThread,
  }
}
