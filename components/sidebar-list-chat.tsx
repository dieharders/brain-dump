import { getChats, removeChat, shareChat } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions-chat'
import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-chat'

export interface SidebarChatListProps {
  userId?: string
}

export async function SidebarChatList({ userId }: SidebarChatListProps) {
  const chats = await getChats(userId)

  return (
    <div className="flex-1 overflow-auto">
      {/* Add new data */}
      <div className="flex items-center justify-center">
        <NewItem
          actionTitle="+ Add New Chat"
          actionDescription="This will start a new chat session."
        ></NewItem>
      </div>
      {/* List of data */}
      {chats?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {chats.map(
            chat =>
              chat && (
                <SidebarItem key={chat?.id} chat={chat}>
                  <SidebarActions
                    chat={chat}
                    removeChat={removeChat}
                    shareChat={shareChat}
                  />
                </SidebarItem>
              ),
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
