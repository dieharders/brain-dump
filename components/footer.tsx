import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className,
      )}
      {...props}
    >
      Ai chatbot built with{' '}
      <ExternalLink href="https://nextjs.org">Next.js ☄</ExternalLink>{' '}
      <ExternalLink href="https://llamaindex.ai">LLamaIndex 🦙</ExternalLink> and{' '}
      <ExternalLink href="https://trychroma.com">ChromaDB 💾</ExternalLink>.
    </p>
  )
}
