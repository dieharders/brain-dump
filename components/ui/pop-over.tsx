import { ReactNode, useState } from 'react'
import { Root, Trigger, Content, Portal } from '@radix-ui/react-popover'
import styles from '@/components/ui/pop-over.module.css'
import { cn } from '@/lib/utils'

interface I_Props {
  trigger: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined
  portal?: boolean // Whether to wrap in a portal
  children?: React.ReactNode | string
}

export const PopOver = ({ side = 'top', trigger, portal = false, children = 'content' }: I_Props) => {
  const [open, setOpen] = useState(false)
  const ContentWrapper = ({ children }: { children: ReactNode }) => {
    return portal ?
      <Portal>{children}</Portal>
      :
      children
  }

  return (
    <Root open={open} onOpenChange={setOpen} >
      <Trigger asChild>
        {trigger}
      </Trigger>
      <ContentWrapper>
        <Content
          className={cn(styles.PopoverContent, 'w-48 rounded-md border border-neutral-600 bg-muted p-3 text-sm text-neutral-500')}
          sideOffset={8}
          side={side}
        >
          {children}
        </Content>
      </ContentWrapper>
    </Root>
  )
}
