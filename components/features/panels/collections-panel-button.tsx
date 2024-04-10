'use client'

import { Suspense } from 'react'
import { Session } from 'next-auth/types'
import { Sidebar } from '@/components/sidebar'
import { SidebarBrainList } from '@/components/sidebar-list-brain'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { ArchiveIcon } from '@radix-ui/react-icons'
import { useMemoryActions } from '@/components/features/crud/actions'

export const CollectionsButton = ({ session }: { session: Session }) => {
  const { deleteAllCollections } = useMemoryActions()

  return (
    <Sidebar title="Collections" icon={ArchiveIcon}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <SidebarBrainList userId={session?.user?.id} />
      </Suspense>
      {/* Align footer to bottom of panel */}
      <SidebarFooter className="mt-auto py-8">
        <ClearData action={deleteAllCollections} actionTitle="Delete all collections" />
      </SidebarFooter>
    </Sidebar>
  )
}