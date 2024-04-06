'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function KnowledgeBasePage() {
  const search = useSearchParams()
  const id = search.get('id')
  const router = useRouter()

  const renderNotFound = (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-8 p-8">
      <p className="text-8xl">🥺</p>
      <span className="text-center text-2xl font-bold">No collection found, so sad.</span>
      <Button
        variant="outline"
        className="text-md"
        onClick={() => router.replace('home')}
      >
        Back to Main Menu</Button>
    </div>
  )

  const doc = (
    <div>Some document</div>
  )

  return id ? doc : renderNotFound
}
