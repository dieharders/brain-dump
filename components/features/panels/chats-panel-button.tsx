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
  const { setThreads, currentThreadId, setCurrentMessages, isAiThinking } = useGlobalContext()
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
        // Update threads data
        if (res?.success && res.data) {
          if (isAiThinking) {
            setThreads(prev => {
              const seen = new Set()
              const array = [...prev, ...res.data]
              // Prevent dupes
              return array.filter(item => {
                if (seen.has(item.id)) {
                  return false
                } else {
                  seen.add(item.id)
                  return true
                }
              })
            })
          } else {
            setThreads(res.data)
          }
        }
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