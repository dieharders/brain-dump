import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Root, List, Trigger, Content } from '@radix-ui/react-tabs'

interface I_Tab {
  label: string
  title?: string
  icon?: string
  key?: string
  content: React.ReactNode
}

interface I_Props {
  className?: string
  label: string
  tabs: I_Tab[]
  onChange?: (val: string) => void
}

export const Tabs = ({ className = '', label = 'Tabs Menu', tabs = [], onChange = () => { } }: I_Props) => {
  const [checked, setChecked] = useState<string>(tabs?.[0]?.label || tabs?.[0]?.key || '')

  return (
    <Root
      className="flex flex-col justify-between overflow-hidden"
      defaultValue={tabs?.[0]?.label || tabs?.[0]?.key}
      onValueChange={(val) => {
        setChecked(val)
        onChange(val)
      }}
    >
      {/* Tabs */}
      <List className="mb-8 mt-4 flex shrink-0 rounded-none" aria-label={label}>
        {tabs.map(i => {
          const itemKey = (i?.key && i.key.length > 0 && i.key) || i.label

          return (
            <Trigger
              key={itemKey}
              value={i.label || i.key || ''}
              className="min-h-4 flex w-full flex-1 cursor-default items-end justify-center text-xl font-semibold capitalize"
            >
              <label className="w-full" title={i.title}>
                <input
                  className="peer hidden"
                  type="radio"
                  checked={checked === i.label || checked === i.key}
                  onChange={() => { /* Prevent browser error msg */ }}
                  name="trigger-radio-button"
                />
                <div title={i.label || i?.key} className={cn('text-md cursor-pointer border-b-2 border-b-neutral-300 p-2 text-primary/50 hover:border-b-neutral-400 hover:text-primary peer-checked:border-b-primary peer-checked:text-primary dark:border-b-accent dark:hover:border-b-neutral-600 dark:peer-checked:border-b-muted-foreground', className)} >
                  {i.icon}<br /><div className="hidden sm:block">{i.label}</div>
                </div>
              </label>
            </Trigger>
          )
        })}
      </List>
      {/* Content */}
      {tabs.map(i => {
        const itemKey = (i?.key && i.key.length > 0 && i.key) || i.label
        return (
          <Content key={itemKey} value={itemKey}>
            {i.content}
          </Content>
        )
      })}
    </Root>
  )
}
