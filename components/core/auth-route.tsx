'use client'

import auth from '@/lib/auth/auth'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { I_Session } from '@/lib/hooks/use-local-chat'
import { useEffect, useState } from 'react'

// Mock the auth func with our custom data from sessionStorage
export const AuthRoute = ({ fallback = null, children }: any) => {
  const [session, setSession] = useState<I_Session>()
  const router = useRouter()
  const pathname = usePathname()
  const isBaseURL = pathname === '/'

  useEffect(() => {
    if (typeof window === 'undefined') return
    const session = auth()
    if (!session && !isBaseURL) router.push('/')
    setSession(session)
  }, [isBaseURL, router])

  return session ? children : fallback
}
