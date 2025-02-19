import { useState } from 'react'
import { Root, Trigger, Content, PopoverPortal } from '@radix-ui/react-popover'
import styles from '@/components/ui/pop-over.module.css'
import { cn } from '@/lib/utils'

interface I_Props {
  trigger: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined
  children?: React.ReactNode | string
}

export const PopOver = ({ side = 'top', trigger, children = 'content' }: I_Props) => {
  const [open, setOpen] = useState(false)

  return (
    <Root open={open} onOpenChange={setOpen} >
      <Trigger asChild>
        {trigger}
      </Trigger>
      <PopoverPortal>
        <Content
          className={cn(styles.PopoverContent, 'w-48 rounded-md border border-neutral-600 bg-muted p-3 text-sm text-neutral-500')}
          sideOffset={8}
          side={side}
        >
          {children}
        </Content>
      </PopoverPortal>
    </Root>
  )
}
