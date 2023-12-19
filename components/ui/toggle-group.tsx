import React from 'react'
import { Root, Item } from '@radix-ui/react-toggle-group'

interface I_Props {
  children: React.ReactNode
  label: string
}

const ToggleGroup = ({ children, label }: I_Props) => (
  <Root
    className="border-1 flex w-fit flex-row gap-2 rounded-sm border-solid border-black bg-muted p-2"
    type="single"
    defaultValue="center"
    aria-label={label}
  >
    {React.Children.map(children, child => (
      <Item className="ToggleGroupItem" value="left" aria-label="Left aligned">
        {child}
      </Item>
    ))}

  </Root>
)

export default ToggleGroup
