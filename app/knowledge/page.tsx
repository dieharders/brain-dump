'use client'

import { usePathname } from 'next/navigation'

export default function KnowledgeBasePage() {
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url

  return null
}
