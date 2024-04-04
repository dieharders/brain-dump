import { NativeItem, NativeSelect, NativeItemGroup } from '@/components/ui/select-native'
import {
  Select as SelectCustom,
  SelectContent,
  SelectGroup as SelectGroupCustom,
  SelectLabel as SelectLabelCustom,
  SelectTrigger,
  SelectValue,
  SelectItem as SelectItemCustom,
} from '@/components/ui/select-custom'

type T_Group = {
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
}

export const Select = ({ id, name, value, placeholder = '', onChange, items }: I_SelectProps) => {
  const nativeItems = items.map(i => {
    if (i?.isLabel) return <NativeItemGroup key={i?.name} name={i?.name}>{i?.name}</NativeItemGroup>
    return <NativeItem key={i?.value} name={i?.name || ''} value={i?.value || ''}>{i?.value}</NativeItem>
  })

  const customItems = items.map(i => {
    if (i?.isLabel) return <SelectLabelCustom key={i?.name} className="select-none uppercase text-indigo-500">{i?.name}</SelectLabelCustom>
    return <SelectItemCustom key={i?.value} value={i?.value || ''}>{i?.name}</SelectItemCustom>
  })

  return (
    <>
      {/* Native select */}
      <NativeSelect id={id} name={name} onChange={onChange}>{nativeItems}</NativeSelect>
      {/* Custom select */}
      <SelectCustom
        value={value || undefined}
        onValueChange={onChange}
      >
        <SelectTrigger className="hidden h-fit w-full bg-accent p-4 text-lg [@media(hover:hover)]:flex">
          <SelectValue placeholder={placeholder}></SelectValue>
        </SelectTrigger>
        <SelectGroupCustom className="hidden [@media(hover:hover)]:flex">
          <SelectContent className="p-1">
            {customItems}
          </SelectContent>
        </SelectGroupCustom>
      </SelectCustom>
    </>
  )
}
