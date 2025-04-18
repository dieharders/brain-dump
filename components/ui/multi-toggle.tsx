import React, { ReactElement } from 'react'
import { Root, Indicator } from '@radix-ui/react-checkbox'
import { CheckIcon } from '@radix-ui/react-icons'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface I_PanelCardProps {
  isActive?: boolean // when hovered or clicked
  isSelected?: boolean // when selected in a checkbox
  onClick?: () => void
  className?: string
}

type T_Stat = {
  icon?: string
  value: number | string
  name: string
}

export interface I_SelItemData {
  id: string
  name: string
  description?: string
  icon?: string
  stats?: T_Stat[]
}

interface I_PanelProps extends I_PanelCardProps {
  child: ReactElement
}

export const MultiSelectPanel = (props: I_PanelProps) => {
  const { onClick, isSelected, isActive: isHighlighted, className, child } = props
  const [isActive, setIsActive] = useState(false)

  return (
    <div
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'hover-bg-accent relative flex h-fit min-h-[9rem] w-full select-none flex-col space-y-4 overflow-hidden py-4 text-left sm:w-[20rem]',
        className,
        (isActive || isHighlighted) && 'bg-accent',
        isSelected && 'bg-accent',
        onClick && 'cursor-pointer',
      )}
      onClick={e => {
        e.preventDefault()
        onClick && onClick()
      }}
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
    >
      {
        React.isValidElement(child) ?
          React.cloneElement<any>(child, {
            isHighlighted: isHighlighted || false,
          })
          :
          child // If not a React element, return it as is
      }
    </div>
  )
}

interface I_MultiSelectItemProps {
  value: string
  index: number
  selected: string[]
  setSelected: Dispatch<SetStateAction<any>>
  className?: string
  child: ReactElement
}

export const MultiSelectItem = ({ value, index, selected, setSelected, className, child }: I_MultiSelectItemProps) => {
  const [isActive, setIsActive] = useState(false)
  const selectedItem = selected?.find(name => name === value)
  const isInList = typeof selectedItem !== 'undefined'

  const onChange = useCallback(() => {
    if (!isInList) {
      setSelected([...selected, value])
    }
    else {
      const indItem = selected.findIndex(i => i === value)
      const newVal = [...selected]
      newVal.splice(indItem, 1)
      setSelected(newVal)
    }
  }, [isInList, value, selected, setSelected])

  return <span className="justify-left flex w-full flex-row items-center space-x-8">
    <Root
      id={`c${index}`}
      checked={isInList}
      onCheckedChange={onChange}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      className="flex items-center justify-center rounded border border-gray-800 bg-background hover:shadow-[0_0_0.5rem_0.1rem_rgba(10,10,10,0.5)] dark:hover:shadow-[0_0_0.5rem_0.1rem_rgba(99,102,241,0.9)]"
    >
      <div className="flex h-6 w-6 items-center justify-center">
        <Indicator >
          <CheckIcon className="h-4 w-4" />
        </Indicator>
      </div>
    </Root>
    <label
      className="w-full flex-1 overflow-hidden pr-2"
      htmlFor={`c${index}`}
    >
      <MultiSelectPanel
        onClick={onChange}
        isSelected={isInList}
        isActive={isActive}
        child={child}
        className={className}
      />
    </label>
  </span>
}

interface I_MultiSelectorProps {
  initValue?: string[]
  options: string[]
  onSelect: (val: any) => void
  children: ReactElement[]
  className?: string
}

/**
 * A component that displays multiple cards in a list that can be selected by toggling. One or more items can be selected at once.
 */
export const MultiSelector = ({ options, onSelect, children, initValue = [], className }: I_MultiSelectorProps) => {
  const [selected, setSelected] = useState<string[]>(initValue)
  const onSelected = (val: any) => {
    onSelect(val)
    setSelected(val)
  }

  return (
    <>
      {/* Buttons */}
      {options.length > 0 && (
        <div className="mb-6 flex w-full flex-row items-center justify-between space-x-4">
          <Button
            className="m-0 w-full p-0"
            onClick={() => {
              // Add all items to list
              onSelected(options)
            }}
          >
            Add all
          </Button>
          <Button
            className="m-0 w-full p-0"
            onClick={async () => {
              // Remove all items from list
              onSelected([])
            }}
          >
            Remove all
          </Button>
        </div>
      )}
      {/* Selections */}
      <div className="scrollbar flex max-h-[32rem] w-full flex-col space-y-2 overflow-y-auto overflow-x-hidden pl-2">
        {children?.map((child, i) =>
          <MultiSelectItem
            key={options[i]}
            value={options[i]}
            index={i}
            selected={selected}
            setSelected={onSelected}
            className={className}
            child={child}
          />
        )}
      </div>
    </>
  )
}
