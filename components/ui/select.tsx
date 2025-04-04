import { NativeItem, NativeSelect, NativeItemGroup } from '@/components/ui/select-native'
import {
  Select as SelectCustom,
  SelectContent as SelectContentCustom,
  SelectGroup as SelectGroupCustom,
  SelectLabel as SelectLabelCustom,
  SelectTrigger as SelectTriggerCustom,
  SelectValue as SelectValueCustom,
  SelectItem as SelectItemCustom,
} from '@/components/ui/select-custom'
import { cn } from '@/lib/utils'

export type T_Group = {
  name: string
  value?: string
}
type T_Item = {
  name: string
  isLabel?: boolean
}
interface I_SelectProps {
  id?: string
  name?: string
  value: string | undefined
  placeholder?: string
  onChange: (val: string) => void
  items: Array<T_Group & T_Item | null>
  className?: string
}

export const Select = ({ id, name, value, placeholder = '', className, onChange, items }: I_SelectProps) => {
  const nativeItems = items?.map(i => {
    if (i?.isLabel) return <NativeItemGroup key={i?.name} name={i?.name}>{i?.name}</NativeItemGroup>
    return <NativeItem key={i?.value} name={i?.name || ''} value={i?.value || ''}>{i?.value}</NativeItem>
  })

  const customItems = items?.map(i => {
    if (i?.isLabel) return <SelectLabelCustom key={i?.name} className="select-none uppercase text-indigo-500">{i?.name}</SelectLabelCustom>
    return <SelectItemCustom key={i?.value} value={i?.value || ''}>{i?.name}</SelectItemCustom>
  })

  return (
    <>
      {/* Native select */}
      <NativeSelect id={id} name={name} onChange={onChange} className={className}>{nativeItems}</NativeSelect>
      {/* Custom select */}
      <SelectCustom
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTriggerCustom className={cn('text-md hidden h-fit w-full truncate bg-background px-3 py-2 hover:bg-accent [@media(hover:hover)]:flex', className)}>
          <SelectValueCustom placeholder={placeholder}></SelectValueCustom>
        </SelectTriggerCustom>
        <SelectGroupCustom className="hidden [@media(hover:hover)]:flex">
          <SelectContentCustom className="max-h-64 p-1">
            {customItems}
          </SelectContentCustom>
        </SelectGroupCustom>
      </SelectCustom>
    </>
  )
}
