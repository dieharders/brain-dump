import { useState } from "react"
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"
// import { useModelDownloader } from "@/components/features/downloader/hook-model-downloader"

interface I_Props {
  title: string
  id: string
  description?: string | undefined
  fileSize?: number | undefined
  ramSize?: number
  licenses?: string[] | undefined
  provider?: string | undefined
  fileName?: string | undefined
  Icon?: any
  className?: string
  expandable?: boolean
  onClick?: (id: string) => void
}

export const ModelCard = ({ expandable = true, onClick = (id: string) => { }, fileName, title, id, description, fileSize, ramSize, licenses, provider, Icon, className }: I_Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const heightStyle = isOpen ? 'h-fit' : ''
  const justifyStyle = isOpen ? 'justify-start' : 'justify-center'
  const secTextStyle = 'text-primary inline'
  const maker = (isOpen && provider) ? `${provider}/` : ''
  const titlestr = isOpen ? fileName : title

  // Downloader Hook
  // const {
  //   downloadProgress,
  //   progressState,
  //   importDownload,
  //   startDownload,
  //   pauseDownload,
  //   cancelDownload,
  //   deleteDownload,
  // } = useModelDownloader()

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn("flex w-full flex-col items-start gap-2 overflow-hidden border-primary/10 bg-muted/50 p-6 text-left text-primary hover:bg-indigo-600", heightStyle, justifyStyle, className)}
      onClick={() => {
        // Expand down to show description, and load the quantization menu
        expandable && setIsOpen(prev => !prev)
        onClick(id)
      }}
    >
      {/* Name */}
      <div className="text-nowrap flex-1 text-ellipsis whitespace-nowrap text-left text-lg">
        {/* Icon */}
        {Icon && <Icon className="mr-1 inline text-foreground" />}
        {maker}{titlestr}
      </div>
      {/* Arch Type */}

      {/* Parameter Count */}

      {/* File Format (GGUF) */}

      {/* Description */}
      <div className={cn("text-ellipsis break-normal text-primary/50", !isOpen && "hidden")}>{description}</div>
      {/* Info/Stats */}
      <div className={cn("text-nowrap inline-flex w-full shrink-0 flex-col items-stretch justify-start gap-2 text-ellipsis whitespace-nowrap break-words p-0 text-left text-sm text-primary/50 lg:w-72", !isOpen && "hidden")}>
        {fileSize && <div><p className={cn(secTextStyle)}>Disk: </p>{fileSize} Gb</div>}
        {ramSize && <div><p className={cn(secTextStyle)}>RAM: </p>{ramSize} Gb</div>}
        {provider && <div><p className={cn(secTextStyle)}>Provider: </p>{provider}</div>}
        {licenses?.length && licenses?.length > 0 && <div><p className={cn(secTextStyle)}>License: </p>{licenses?.join(', ')}</div>}
      </div>
    </Button>
  )
}
