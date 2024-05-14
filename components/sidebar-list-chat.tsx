import { removeChat, shareChat } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions-chat'
import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-chat'
import { Chat } from '@/lib/types'

export interface SidebarChatListProps {
  userId?: string
}

const getExampleChatsAction = async (userId: string): Promise<Chat[]> => {
  return [
    {
      id: '10101-101',
      title: 'Some title',
      createdAt: new Date(),
      userId,
      path: '/',
      messages: [{
        id: 'msg-101',
        createdAt: new Date(),
        content: 'This is a first part of conversation.',
        role: 'assistant',
      }],
    }
  ]
}

export async function SidebarChatList({ userId }: SidebarChatListProps) {
  const chats = await getExampleChatsAction(userId || '') // await getChats(userId)

  return (
    <div className="scrollbar flex flex-1 flex-col gap-8 overflow-auto">
      {/* Add new data */}
      <div className="flex w-full items-center justify-center px-4">
        <NewItem
          actionTitle="+ Add New Chat"
          actionDescription="This will start a new chat session."
        ></NewItem>
      </div>
      {/* List of data */}
      {chats?.length ? (
        <div className="space-y-2 px-2">
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
