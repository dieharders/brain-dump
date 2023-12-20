import React, { useState } from 'react'
import { Root, Item } from '@radix-ui/react-toggle-group'

interface I_Props {
  children: React.ReactNode
  label: string
  defaultValue: string
}

const ToggleGroup = ({ children, label = 'Toggle Group', defaultValue = '0' }: I_Props) => {
  const [checked, setChecked] = useState<string>(defaultValue)

  return (
    <Root
      className="border-1 flex w-fit flex-row flex-wrap gap-2 rounded-sm border-solid border-black bg-muted p-2"
      type="single" // assign unique "name" prop to each <input> if you wish to use type="multiple"
      defaultValue={defaultValue}
      aria-label={label}
      onValueChange={val => val && setChecked(val)}
    >
      {React.Children.map(children, (child, index) => (
        <Item className="h-auto w-fit flex-1 rounded text-left hover:bg-primary/10" value={index.toString()} aria-label={`${label} ${index.toString()}`}>
          <input className="peer hidden" type="radio" checked={checked === index.toString()} onChange={() => { /* Prevent browser error msg */ }} name="toggle-radio-button" />
          <div className="flex flex-row gap-2 rounded p-2 peer-checked:bg-primary/25" onClick={() => { /* Save state here */ }}>
            {child}
          </div>
        </Item>
      ))}

    </Root>
  )
}

export default ToggleGroup
