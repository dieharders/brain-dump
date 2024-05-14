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
          className="m-0 h-10 w-10 p-2"
          onClick={() => {
            onClick && onClick()
          }}>
          {icon && <Icon className="h-6 w-6" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className={cn("inset-y-0 flex h-auto w-full flex-col p-0 sm:w-fit", className)}>
        <SheetHeader className="p-4">
          <SheetTitle className="text-sm">{title || 'Title'}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
