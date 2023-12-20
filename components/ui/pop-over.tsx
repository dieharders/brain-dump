import { useState } from 'react'
import { Root, Trigger, Content } from '@radix-ui/react-popover'

interface I_Props {
  trigger: React.ReactNode
  side?: "top" | "right" | "bottom" | "left" | undefined
  children?: React.ReactNode | string
}

export const PopOver = ({ side = 'top', trigger, children = 'content' }: I_Props) => {
  const [open, setOpen] = useState(false)

  return (
    <Root open={open} onOpenChange={setOpen} >
      <Trigger asChild>
        {trigger}
      </Trigger>
      <Content
        className="w-48 rounded-md border border-primary/25 bg-neutral-900 p-3 text-sm text-primary/90 shadow-md"
        sideOffset={8}
        side={side}
      >
        {children}
      </Content>
    </Root>
  )
}
