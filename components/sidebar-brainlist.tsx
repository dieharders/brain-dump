import { getChats, removeChat, shareChat, newBrain } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-item-actions'
import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item'

export interface SidebarBrainListProps {
  userId?: string
}

export async function SidebarBrainList({ userId }: SidebarBrainListProps) {
  const chats = await getChats(userId)

  return (
    <div className="flex-1 overflow-auto">
      {/* Add new data */}
      <div className="flex items-center justify-center">
        <NewItem
          action={newBrain}
          actionTitle="+ Add New Brain"
          actionDescription="This will add a new brain dump to your collection."
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
          <p className="text-sm text-muted-foreground">No Brains Found</p>
        </div>
      )}
    </div>
  )
}
