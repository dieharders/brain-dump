'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { Sidebar } from '@/components/sidebar'
import { SidebarBrainList } from '@/components/sidebar-list-brain'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/clear-data'
import { useHomebrew } from '@/lib/homebrew'

export const CollectionsButton = ({ session }: { session: Session }) => {
  const { getServices } = useHomebrew()

  /**
   * Wipe entire vector database
   */
  const clearCollections = async () => {
    const services = await getServices()
    await services?.memory.wipe()
  }

  return (
    <Sidebar title="Knowledge Graph" icon="brain">
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <SidebarBrainList userId={session?.user?.id} />
      </Suspense>
      <SidebarFooter>
        <ClearData clearAction={clearCollections} actionTitle="Delete all collections" />
      </SidebarFooter>
    </Sidebar>
  )
}