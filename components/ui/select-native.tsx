import { Dispatch, ReactNode, SetStateAction } from "react"
import { cn } from "@/lib/utils"

/**
 * Render a native OS <option> group label
 */
export const NativeItemGroup = ({ name, children }: { name?: string, children?: ReactNode }) => {
    return (<option selected disabled hidden aria-hidden label={name}>{children}</option>)
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
    const nativeSelectStyle = cn("my-1 flex w-full rounded-md bg-accent p-4 text-lg capitalize outline-2 outline-offset-2 outline-muted focus:hover:outline [@media(hover:hover)]:hidden")
    return (
        <select id={id} onChange={({ target: { value } }) => onChange(value)} name={name} size={size} className={cn(nativeSelectStyle, className)} aria-labelledby={name}>
            {children}
        </select>
    )
}
