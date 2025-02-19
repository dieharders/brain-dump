'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ANON } from '@/lib/auth/providers/anonymous'
import { UserInput } from '@/components/features/forms/input-username'
import { LoginButton } from '@/components/features/forms/login-button'
import { IconUsers, IconGitHub, IconVercel } from '@/components/ui/icons'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const LoginForm = (args: { onSuccess: () => void }) => {
  const { theme } = useTheme()
  const { onSuccess } = args
  const [usernameValue, setUsernameValue] = useState('')
  const [hasMounted, setHasMounted] = useState(false)
  const btnStyle = 'min-h-[3rem] w-full'
  const icon = theme === 'dark' ? '🍺' : '☕'

  // Make sure this is client side, otherwise theme is used incorrect
  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  if (!hasMounted) return null
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-between justify-items-stretch gap-8">
      {/* Icon */}
      <div className="max-h-48 flex-1 self-center pt-12 text-6xl font-bold">{icon}</div>
      {/* Sign in menu */}
      <div className="flex w-[20rem] flex-1 flex-col items-center justify-start gap-2 overflow-hidden p-2 pb-10 pt-4">
        <div className="mb-8 text-3xl font-bold">Welcome back</div>
        {/* Anon sign in */}
        <UserInput usernameValue={usernameValue} setUsernameValue={setUsernameValue} className={cn(btnStyle, 'text-md mb-4')} />
        <LoginButton name={ANON} text="Login as Anonymous" username={usernameValue} onSuccess={onSuccess} className={cn(btnStyle, 'bg-sky-600 text-sky-100 hover:bg-sky-800 hover:text-sky-100')} />
        {/* Go to Sign Up page */}
        <p className="mt-2 text-sm font-normal">
          {'Don\'t have an account?'}
          <Button variant="link">
            <Link href="/sign-in?create=true" prefetch={false} className="text-sky-400">Sign Up</Link>
          </Button>
        </p>
        {/* Seperator */}
        <div className="my-4 flex w-full flex-row items-center justify-center gap-4 overflow-hidden text-sm">
          <Separator />OR<Separator />
        </div>
        {/* Providers */}
        <LoginButton name="credentials" icon={IconUsers} text="Login with Email" onSuccess={onSuccess} className={btnStyle} />
        <LoginButton name="github" icon={IconGitHub} onSuccess={onSuccess} className={btnStyle} />
        <LoginButton name="google" icon={IconVercel} text="Login with Google" onSuccess={onSuccess} className={btnStyle} />
      </div>
      {/* Footer */}
      <div className="pb-16 text-center"><Button variant="link">Terms of Use</Button> | <Button variant="link">Privacy Policy</Button></div>
    </div>
  )
}
