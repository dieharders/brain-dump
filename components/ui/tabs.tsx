import { Root, List, Trigger, Content } from '@radix-ui/react-tabs'
import { useState } from 'react'

interface I_Tab {
  label: string
  title?: string
  content: React.ReactNode
}

interface I_Props {
  className?: string
  label: string
  tabs: I_Tab[]
  onChange?: (val: string) => void
}

export const Tabs = ({ className = '', label = 'Tabs Menu', tabs = [], onChange = () => { } }: I_Props) => {
  const [checked, setChecked] = useState<string>(tabs?.[0]?.label || '')

  return (
    <Root
      className="flex flex-col justify-between overflow-hidden"
      defaultValue={tabs[0].label}
      onValueChange={(val) => {
        setChecked(val)
        onChange(val)
      }}
    >
      {/* Tabs */}
      <List className="mb-4 mt-8 flex shrink-0 rounded-none" aria-label={label}>
        {tabs.map(i => {
          return (
            <Trigger
              key={i.label}
              value={i.label}
              className="min-h-4 flex w-full flex-1 cursor-default items-end justify-center text-lg font-semibold capitalize"
            >
              <label className="w-full" title={i.title}>
                <input
                  className="peer hidden"
                  type="radio"
                  checked={checked === i.label}
                  onChange={() => { /* Prevent browser error msg */ }}
                  name="trigger-radio-button"
                />
                <div className={`border-b-2 py-2 text-primary/50 hover:border-b-primary/50 hover:text-primary peer-checked:border-b-primary peer-checked:text-primary ${className}`} >
                  {i.label}
                </div>
              </label>
            </Trigger>
          )
        })}
      </List>
      {/* Content */}
      {tabs.map(i => {
        return (
          <Content key={i.label} value={i.label}>
            {i.content}
          </Content>
        )
      })}
    </Root>
  )
}
