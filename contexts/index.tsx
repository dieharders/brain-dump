import { useContext } from 'react'
import { GlobalContext } from '@/contexts/global-context'

export const useGlobalContext = () => useContext(GlobalContext)
