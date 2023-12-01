'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { Sidebar } from '@/components/sidebar'
import { SidebarBrainList } from '@/components/sidebar-list-brain'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/clear-data'
import { useHomebrew } from '@/lib/homebrew'
import { toast } from 'react-hot-toast'

export const CollectionsButton = ({ session }: { session: Session }) => {
  const { getServices } = useHomebrew()

  /**
   * Wipe entire vector database
   */
  const clearCollections = async () => {
    try {
      const services = await getServices()
      const result = await services?.memory.wipe()
      if (!result?.success) throw new Error(result?.message)
      toast.success('All memories successfully removed')
      return true
    } catch (err) {
      toast.error(`${err}`)
      return false
    }
  }

  return (
    <Sidebar title="Knowledge Graph" icon="brain">
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <SidebarBrainList userId={session?.user?.id} />
      </Suspense>
      {/* Align footer to bottom of panel */}
      <SidebarFooter className="mt-auto">
        <ClearData clearAction={clearCollections} actionTitle="Delete all collections" />
      </SidebarFooter>
    </Sidebar>
  )
}