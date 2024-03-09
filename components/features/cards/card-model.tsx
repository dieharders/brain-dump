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
      className={cn("flex w-full flex-col items-start justify-center gap-2 overflow-hidden border-primary/10 bg-muted/50 p-6 text-left text-primary hover:bg-indigo-600", heightStyle, className)}
      onClick={() => {
        // Expand down to show description, and load the quantization menu
        expandable && setIsOpen(prev => !prev)
        onClick(id)
      }}
    >
      {/* Name */}
      <div className="flex-1 text-lg">
        {/* Icon */}
        {Icon && <Icon className="mr-1 inline text-foreground" />}
        {maker}{titlestr}
      </div>
      {/* Description */}
      <div className={cn("text-primary/50", !isOpen && "hidden")}>{description}</div>
      {/* Info/Stats */}
      <div className={cn("inline-flex w-full shrink-0 flex-col items-stretch justify-start gap-2 break-words p-0 text-left text-sm text-primary/50 lg:w-72", !isOpen && "hidden")}>
        {fileSize && <p><p className={cn(secTextStyle)}>Disk: </p>{fileSize} Gb</p>}
        {ramSize && <p><p className={cn(secTextStyle)}>RAM: </p>{ramSize} Gb</p>}
        {provider && <p><p className={cn(secTextStyle)}>Provider: </p>{provider}</p>}
        {licenses?.length && licenses?.length > 0 && <p><p className={cn(secTextStyle)}>License: </p>{licenses?.join(', ')}</p>}
      </div>
    </Button>
  )
}
