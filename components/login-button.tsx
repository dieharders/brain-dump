'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {
  name: string
  showIcon?: boolean
  callbackUrl?: string
  text?: string
  icon?: any
}

export function LoginButton({
  name,
  text = 'Login with GitHub',
  icon,
  callbackUrl = `/`,
  showIcon = true,
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const IconComponent = icon

  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        signIn(name, { callbackUrl })
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
