import React from 'react'
import { Root, Item } from '@radix-ui/react-toggle-group'

interface I_Props {
  children: React.ReactNode
  label: string
  defaultValue?: string
  value: string
  onChange: (val: string) => void
}

const ToggleGroup = ({ children, label = 'Toggle Group', defaultValue = 'completion', value, onChange }: I_Props) => {
  return (
    <Root
      className="border-1 flex w-fit flex-row flex-wrap gap-2 rounded-sm border-solid border-black bg-muted p-2"
      type="single" // assign unique "name" prop to each <input> if you wish to use type="multiple"
      defaultValue={defaultValue}
      aria-label={label}
      onValueChange={(val: string) => val && onChange(val)}
    >
      {React.Children.map(children, (child, index) => {
        // Children should have "id" attr set on the parent,
        // otherwise their index is used as the value
        const id: string = React.isValidElement(child) && child.props.id
        const val = id || index.toString()
        const isChecked = value === id || value === index.toString()
        const focusClass = isChecked ? 'bg-primary/25' : ''

        return (
          <Item
            value={val}
            aria-label={`${label} ${index.toString()}`}
            className={`h-auto w-fit flex-1 rounded text-left hover:bg-primary/10 ${focusClass}`}
          >
            <input
              name="toggle-radio-button"
              type="radio"
              checked={isChecked}
              onChange={() => { /* Prevent browser error msg */ }}
              className="peer hidden"
            />
            {child}
          </Item>
        )
      })}

    </Root>
  )
}

export default ToggleGroup
