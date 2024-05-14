'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface SidebarProps {
  children?: ReactNode
  title?: string
  icon?: any
  className?: string
  onClick?: () => void
}

export function Panel({ children, title, icon, className, onClick }: SidebarProps) {
  const Icon = icon
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mx-1 h-9 w-9 p-0"
          onClick={() => {
            onClick && onClick()
          }}>
          {icon && <Icon className="h-6 w-6" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className={cn("inset-y-0 flex h-auto w-[18rem] flex-col p-0", className)}>
        <SheetHeader className="p-4">
          <SheetTitle className="text-sm">{title || 'Title'}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
