import { getBrains, removeBrain, shareBrain, newBrain } from '@/app/actions'
import { SidebarActions } from '@/components/sidebar-actions-brain'
import { NewItem } from '@/components/sidebar-item-new'
import { SidebarItem } from '@/components/sidebar-item-brain'

export interface SidebarBrainListProps {
  userId?: string
}

export async function SidebarBrainList({ userId }: SidebarBrainListProps) {
  const brains = await getBrains(userId)

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
      {brains?.length ? (
        <div className="mt-4 space-y-2 px-2">
          {brains.map(
            brain =>
              brain && (
                <SidebarItem key={brain?.id} brain={brain}>
                  <SidebarActions brain={brain} remove={removeBrain} share={shareBrain} />
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
