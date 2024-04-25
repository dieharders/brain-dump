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

export interface SidebarProps {
  children?: ReactNode
  title?: string
  icon?: any
}

export function Sidebar({ children, title, icon }: SidebarProps) {
  const Icon = icon
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mx-1 h-9 w-9 p-0">
          {icon && <Icon className="h-6 w-6" />}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="inset-y-0 flex h-auto w-[300px] flex-col p-0">
        <SheetHeader className="p-4">
          <SheetTitle className="text-sm">{title || 'Title'}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
