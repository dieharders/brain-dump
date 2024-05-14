'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { SidebarChatList } from '@/components/sidebar-list-chat'
import { Panel } from '@/components/features/panels/panel'
import { PanelFooter } from '@/components/features/panels/panel-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { IconChat } from '@/components/ui/icons'

export const ChatsButton = ({ session }: { session: Session }) => {
  const clearChats = async () => true

  return (
    <Panel title="Chat History" icon={IconChat}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <SidebarChatList userId={session?.user?.id} />
      </Suspense>
      <PanelFooter>
        <ClearData action={clearChats} actionTitle="Clear history" />
      </PanelFooter>
    </Panel>
  )
}