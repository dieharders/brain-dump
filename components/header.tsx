import * as React from 'react'
import Link from 'next/link'
import { auth } from '@/auth'
import { clearChats } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { SidebarChatList } from '@/components/sidebar-chatlist'
import { SidebarBrainList } from '@/components/sidebar-list-brain'
import { IconNextChat } from '@/components/ui/icons'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClearData } from '@/components/clear-data'
import { UserMenu } from '@/components/user-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export async function Header() {
  const session = await auth()
  const chatsButton = (
    <Sidebar title="Chat History" icon="chat">
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <SidebarChatList userId={session?.user?.id} />
      </React.Suspense>
      <SidebarFooter>
        <ClearData clearAction={clearChats} actionTitle="Clear history" />
      </SidebarFooter>
    </Sidebar>
  )
  const brainsButton = (
    <Sidebar title="Knowledge Base" icon="brain">
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <SidebarBrainList userId={session?.user?.id} />
      </React.Suspense>
      <SidebarFooter>
        <ClearData clearAction={clearChats} actionTitle="Delete all brains" />
      </SidebarFooter>
    </Sidebar>
  )

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/70 px-4 backdrop-blur-xl">
      {session?.user ? (
        <div className="flex items-center">
          {/* Chats Pane Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {chatsButton}
                <span className="sr-only">Chat History</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Chats</TooltipContent>
          </Tooltip>
          {/* Brains Pane Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                {brainsButton}
                <span className="sr-only">Uploads</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Uploads</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        // Login
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="mr-2 h-6 w-6 dark:hidden" inverted />
          <IconNextChat className="mr-2 hidden h-6 w-6 dark:block" />
        </Link>
      )}
      {/* Right side */}
      <div className="flex items-center justify-end gap-x-2">
        {/* Account Menu */}
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild>
            <Link href="/sign-in?callbackUrl=/">Login</Link>
          </Button>
        )}
        {/* Light/Dark Mode */}
        <ThemeToggle />
      </div>
    </header>
  )
}
