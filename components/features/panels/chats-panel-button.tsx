'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { SidebarChatList } from '@/components/sidebar-list-chat'
import { Panel } from '@/components/features/panels/panel'
import { PanelFooter } from '@/components/features/panels/panel-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { IconChat } from '@/components/ui/icons'
import { useThreads } from '@/app/client-actions'
import { useGlobalContext } from '@/contexts'

export const ChatsButton = ({ session }: { session: Session }) => {
  // State
  const { setThreads } = useGlobalContext()
  // Actions
  const { getAllThreads, clearChats } = useThreads()

  return (
    <Panel
      title="Chat History"
      icon={IconChat}
      onClick={async () => {
        // Get all chat threads
        const res = await getAllThreads()
        res?.success && res.data && setThreads(res.data)
      }}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <SidebarChatList userId={session?.user?.id} />
      </Suspense>
      <PanelFooter>
        <ClearData action={clearChats} actionTitle="Clear history" />
      </PanelFooter>
    </Panel>
  )
}