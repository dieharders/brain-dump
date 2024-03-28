import { useState } from "react"
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
  onClick?: (id: string) => void
}

export const ModelCard = ({ expandable = true, onClick = (_id: string) => { }, title, id, description, type = '?', libraryName = '', tags = [], downloads = 0, licenses, provider, Icon, className }: I_Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const heightStyle = isOpen ? 'h-fit' : ''
  const justifyStyle = isOpen ? 'justify-start' : 'justify-center'
  const secTextStyle = 'text-primary inline'
  const maker = (isOpen && provider) ? `${provider}/` : ''

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("flex w-full flex-col items-start gap-2 overflow-hidden border-gray-600 bg-muted p-6 text-left text-primary hover:bg-indigo-200 dark:hover:bg-indigo-600", heightStyle, justifyStyle, className)}
      onClick={() => {
        // Expand down to show description, and load the quantization menu
        expandable && setIsOpen(prev => !prev)
        onClick(id)
      }}
    >
      {/* Name */}
      <div className="w-fit whitespace-nowrap text-left text-lg">
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
      <div className={cn("text-nowrap inline-flex w-[50%] shrink-0 flex-col items-stretch justify-start gap-2 text-ellipsis break-words p-0 text-left text-sm text-primary/50", !isOpen && "hidden")}>
        {provider && <div><p className={cn(secTextStyle)}>Provider: </p>{provider}</div>}
        {type && <div><p className={cn(secTextStyle)}>Model Type: </p>{type}</div>}
        <div><p className={cn(secTextStyle)}>Downloads: </p>{downloads}</div>
        {libraryName && <div><p className={cn(secTextStyle)}>Architecture: </p>{libraryName}</div>}
        {licenses?.length && licenses?.length > 0 && <div><p className={cn(secTextStyle)}>License: </p>{licenses?.join(', ')}</div>}
        {tags && <div className="overflow-hidden text-ellipsis whitespace-nowrap"><p className={cn(secTextStyle)}>Tags: </p>{tags.join(', ')}</div>}
      </div>
    </Button>
  )
}
