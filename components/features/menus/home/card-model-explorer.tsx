import { ReactNode, useState } from "react"
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"

interface I_Props {
  title: string
  id: string
  description?: string | undefined
  licenses?: string[] | undefined
  provider?: string | undefined
  type?: string
  downloads?: number
  libraryName?: string
  tags?: Array<string>
  Icon?: any
  className?: string
  expandable?: boolean
  children?: ReactNode
  onClick?: ({ id, isOpen }: { id: string, isOpen: boolean }) => void
}

export const ModelCard = ({ expandable = true, onClick = (_props: { id: string, isOpen: boolean }) => { }, title, id, description, type = '?', libraryName = '', tags = [], downloads = 0, licenses, provider, Icon, children, className }: I_Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const secTextStyle = 'text-primary inline'
  const maker = (isOpen && provider) ? `${provider}/` : ''

  return (
    <div className="flex flex-col items-stretch justify-items-stretch gap-4 md:flex-row">
      {/* Model Button */}
      <Button
        variant="outline"
        size="lg"
        className={cn("h-100 flex w-full flex-col items-start gap-2 overflow-hidden border-gray-600 bg-muted p-4 text-left text-primary hover:border-indigo-600 hover:bg-indigo-200 dark:hover:bg-indigo-600", className)}
        onClick={() => {
          // Expand down to show description, and load the quantization menu
          expandable && setIsOpen(prev => !prev)
          onClick({ id, isOpen })
        }}
      >
        {/* Name */}
        <div className="w-full text-left text-lg">
          <div className="flex flex-row items-center gap-2">
            {/* Icon */}
            {Icon && <Icon className="text-foreground" />}
            {maker}{title}
          </div>
        </div>

        {/* Parameter Count */}

        {/* File Format (GGUF) */}

        {/* Description */}
        <div className={cn("text-ellipsis break-normal text-primary/50", !isOpen && "hidden")}>{description}</div>
        {/* Info/Stats */}
        <div className={cn("text-nowrap inline-flex w-full shrink-0 flex-col items-stretch justify-start gap-2 text-ellipsis break-words p-0 text-left text-sm text-primary/50", !isOpen && "hidden")}>
          {provider && <div><p className={cn(secTextStyle)}>Provider: </p>{provider}</div>}
          {type && <div><p className={cn(secTextStyle)}>Model Type: </p>{type}</div>}
          <div><p className={cn(secTextStyle)}>Downloads: </p>{downloads}</div>
          {libraryName && <div><p className={cn(secTextStyle)}>Architecture: </p>{libraryName}</div>}
          {licenses?.length && licenses?.length > 0 && <div><p className={cn(secTextStyle)}>License: </p>{licenses?.join(', ')}</div>}
          {tags && <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap"><p className={cn(secTextStyle)}>Tags: </p>{tags.join(', ')}</div>}
        </div>
      </Button>
      {/* Download Menu */}
      {isOpen && children}
    </div>
  )
}
