'use client'

import Image from 'next/image'
import appStorage from '@/lib/localStorage'
import { signOut } from 'next-auth/react'
import auth from '@/lib/auth/auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconExternalLink } from '@/components/ui/icons'
import { useEffect, useState } from 'react'
import { I_Session } from '@/lib/hooks/use-local-chat'

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ')
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

export function UserMenu() {
  const [session, setSession] = useState<I_Session>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const s = auth()
      if (s) setSession(s)
    }
  }, [])


  return (
    session ?
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-0">
              {/* User badge */}
              {session.user?.image ? (
                <Image
                  className="h-6 w-6 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                  src={session.user?.image ? `${session.user.image}&s=60` : ''}
                  alt={session.user.name ?? 'Avatar'}
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                  {session.user?.name ? getUserInitials(session.user?.name) : null}
                </div>
              )}
              {/* User name */}
              <span className="mx-2 hidden sm:block">{session.user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
            <DropdownMenuItem className="flex-col items-start">
              <div className="text-xs font-medium">{session.user?.name}</div>
              <div className="text-xs text-zinc-500">{session.user?.email}</div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Docs link */}
            <DropdownMenuItem asChild>
              <a
                href="https://github.com/dieharders/brain-dump"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between text-xs"
              >
                Documentation
                <IconExternalLink className="ml-auto h-3 w-3" />
              </a>
            </DropdownMenuItem>
            {/* Settings link */}
            <DropdownMenuItem asChild>
              <a
                href="/settings"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between text-xs"
              >
                Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                appStorage.clearUserDetails()
                signOut({
                  callbackUrl: '/',
                })
              }}
              className="text-xs"
            >
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      :
      <div></div>
  )
}
