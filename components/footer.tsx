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
      Built with{' '}
      <ExternalLink href="https://nextjs.org">Next.js ☄</ExternalLink>{' '}
      <ExternalLink href="https://llamaindex.ai">LlamaIndex 🦙</ExternalLink>{' '}
      <ExternalLink href="https://trychroma.com">ChromaDB 🌈</ExternalLink>
    </p>
  )
}
