import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Render a native OS <option> group label
 */
export const NativeItemGroup = ({ name, children }: { name?: string, children?: ReactNode }) => {
    // *We replaced "selected" with "value" due to warning "Use value or defaultvalue in <option>"
    return (<option value={name} disabled aria-hidden label={name}>{children}</option>)
}

interface I_ItemProps {
    name: string
    value: string
    children?: ReactNode
}

/**
 * Render a native OS <option> item
 */
export const NativeItem = ({ name, value, children }: I_ItemProps) => {
    return (<option value={value} label={name}>{children}</option>)
}

interface I_SelectProps {
    id?: string
    name?: string
    size?: number
    children: ReactNode | Array<ReactNode>
    onChange: (val: string) => void
    className?: string
}

/**
 * Render a native OS <select> tag
 */
export const NativeSelect = ({ id, name, size = 1, children, onChange, className }: I_SelectProps) => {
    const nativeSelectStyle = cn('text-md flex w-full rounded-md border border-accent bg-background p-3 capitalize outline-2 outline-offset-2 outline-muted hover:bg-accent focus:hover:outline [@media(hover:hover)]:hidden')
    return (
        <select id={id} onChange={({ target: { value } }) => onChange(value)} name={name} size={size} className={cn(nativeSelectStyle, className)} aria-labelledby={name}>
            {children}
        </select>
    )
}
