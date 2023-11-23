'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { SidebarChatList } from '@/components/sidebar-list-chat'
import { Sidebar } from '@/components/sidebar'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/clear-data'

export const ChatsButton = ({ session }: { session: Session }) => {
  const clearChats = async () => true

  return (
    <Sidebar title="Chat History" icon="chat">
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <SidebarChatList userId={session?.user?.id} />
      </Suspense>
      <SidebarFooter>
        <ClearData clearAction={clearChats} actionTitle="Clear history" />
      </SidebarFooter>
    </Sidebar>
  )
}