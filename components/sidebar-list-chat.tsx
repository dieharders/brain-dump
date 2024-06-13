'use client'

import { useThreads } from '@/components/features/chat/hook-chat-actions'
import { SidebarActions } from '@/components/sidebar-actions-chat'
import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-chat'
import { useGlobalContext } from '@/contexts'

export interface SidebarChatListProps {
  userId?: string
}

export const SidebarChatList = ({ userId }: SidebarChatListProps) => {
  const { threads, currentThreadId, setThreads, setCurrentMessages } = useGlobalContext()
  const { removeChat, getAllThreads } = useThreads()

  return (
    <div className="scrollbar flex w-[20rem] flex-1 flex-col gap-8 overflow-auto">
      {/* Add new data */}
      <div className="flex w-full items-center justify-center px-4">
        <NewItem
          actionTitle="+ Add New Chat"
          actionDescription="This will start a new chat session."
          action={async () => {
            currentThreadId.current = ''
            setCurrentMessages([])
          }}
        ></NewItem>
      </div>
      {/* List of data */}
      {threads?.length ? (
        <div className="space-y-2 px-2">
          {threads.map(
            thread =>
              <SidebarItem key={thread?.id} chat={thread}>
                <SidebarActions
                  chat={thread}
                  removeChat={async (id) => {
                    const res = await removeChat(id)
                    if (res) {
                      const refreshedRes = await getAllThreads()
                      if (refreshedRes?.success) {
                        // reset current id
                        currentThreadId.current = ''
                        // update threads list
                        refreshedRes && setThreads(refreshedRes.data)
                        // update messages
                        setCurrentMessages([])
                        return refreshedRes
                      }
                      return refreshedRes
                    }
                    return res
                  }}
                />
              </SidebarItem>
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No Chat History</p>
        </div>
      )}
    </div>
  )
}
