'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { SidebarChatList } from '@/components/sidebar-list-chat'
import { Panel } from '@/components/features/panels/panel'
import { PanelFooter } from '@/components/features/panels/panel-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { IconChat } from '@/components/ui/icons'
import { useThreads } from '@/components/features/chat/hook-chat-actions'
import { useGlobalContext } from '@/contexts'

export const ChatsButton = ({ session }: { session: Session }) => {
  // State
  const { setThreads, currentThreadId, setCurrentMessages } = useGlobalContext()
  // Actions
  const { getAllThreads, clearChats } = useThreads()
  // Methods
  const clearAllData = async () => {
    const res = await clearChats()
    if (res) {
      const refreshedRes = await getAllThreads()
      if (refreshedRes?.success) {
        // reset current id
        currentThreadId.current = ''
        // update threads list
        refreshedRes && setThreads(refreshedRes.data)
        // update messages list
        setCurrentMessages([])
        return refreshedRes?.success || false
      }
      return false
    }
    return false
  }

  return (
    <Panel
      title="Chat History"
      icon={IconChat}
      onClick={async () => {
        // Get all chat threads
        const res = await getAllThreads()
        if (res?.success && res.data) {
          // Update threads data
          setThreads(res.data)
        }
        console.log('@@ threads panel opened')
      }}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <SidebarChatList userId={session?.user?.id} />
      </Suspense>
      <PanelFooter>
        <ClearData action={clearAllData} actionTitle="Clear history" />
      </PanelFooter>
    </Panel>
  )
}