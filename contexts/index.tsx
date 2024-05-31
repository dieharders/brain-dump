import { useContext } from 'react'
import { GlobalContext } from '@/contexts/global-context'
import { ChatContext } from '@/contexts/chat-context'

export const useGlobalContext = () => useContext(GlobalContext)
export const useChatContext = () => useContext(ChatContext)
