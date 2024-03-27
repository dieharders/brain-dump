'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'

interface LoginButtonProps extends ButtonProps {
  name: string
  showIcon?: boolean
  callbackUrl?: string
  text?: string
  icon?: any
  onSuccess?: () => void
}

export function LoginButton(args: LoginButtonProps) {
  const {
    name,
    text = 'Login with GitHub',
    icon,
    callbackUrl = '/',
    showIcon = true,
    onSuccess = () => { },
    className,
    ...props
  } = args
  const [isLoading, setIsLoading] = useState(false)
  const IconComponent = icon

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        const res = await signIn(name, {
          callbackUrl,
          // https://next-auth.js.org/getting-started/client#using-the-redirect-false-option
          redirect: false, // prevents page from refreshing
        })
        if (res?.ok) onSuccess()
        else toast(`Sign in failed.\nStatus: ${res?.status}\nMsg: ${res?.error}`)
      }}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : showIcon ? (
        icon && <IconComponent className="mr-2" />
      ) : null}
      {text}
    </Button>
  )
}
