'use client'

import { Suspense, useCallback } from 'react'
import { Session } from 'next-auth/types'
import { Sidebar } from '@/components/sidebar'
import { SidebarBrainList } from '@/components/sidebar-list-brain'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { ArchiveIcon } from '@radix-ui/react-icons'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'

export const CollectionsButton = ({ session }: { session: Session }) => {
  const { fetchCollections } = useMemoryActions()
  const { deleteAllCollections } = useMemoryActions()
  const { setCollections } = useGlobalContext()

  const updateListAction = useCallback(async () => {
    const data = await fetchCollections()
    data && setCollections(data)
  }, [fetchCollections, setCollections])

  return (
    <Sidebar title="Collections" icon={ArchiveIcon} onClick={updateListAction}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <SidebarBrainList userId={session?.user?.id} fetchAction={updateListAction} />
      </Suspense>
      {/* Align footer to bottom of panel */}
      <SidebarFooter className="mt-auto py-8">
        <ClearData action={deleteAllCollections} actionTitle="Delete all collections" />
      </SidebarFooter>
    </Sidebar>
  )
}