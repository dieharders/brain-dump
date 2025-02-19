'use client'

import { Suspense, useCallback } from 'react'
import { Session } from 'next-auth/types'
import { Panel } from '@/components/features/panels/panel'
import { CollectionList } from '@/components/features/panels/collection-panel-list'
import { PanelFooter } from '@/components/features/panels/panel-footer'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { ArchiveIcon } from '@radix-ui/react-icons'
import { useMemoryActions } from '@/components/features/crud/actions'
import { useGlobalContext } from '@/contexts'

export const CollectionsButton = ({ session }: { session: Session | undefined }) => {
  const { fetchCollections } = useMemoryActions()
  const { deleteAllCollections } = useMemoryActions()
  const { setCollections } = useGlobalContext()

  const fetchAction = useCallback(async () => {
    const data = await fetchCollections()
    data && setCollections(data)
  }, [fetchCollections, setCollections])

  return (
    <Panel title="Collections" icon={ArchiveIcon} onClick={fetchAction}>
      <Suspense fallback={<div className="flex-1 overflow-auto" />}>
        {/* @TODO Pass the user id of the vector database */}
        <CollectionList userId={session?.user?.id} fetchAction={fetchAction} />
      </Suspense>
      {/* Align footer to bottom of panel */}
      <PanelFooter className="mt-auto py-8">
        <ClearData action={deleteAllCollections} actionTitle="Delete all collections" />
      </PanelFooter>
    </Panel>
  )
}