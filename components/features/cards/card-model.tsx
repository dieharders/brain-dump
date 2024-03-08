import { useState } from "react"
import { CancelDownloadButton, DeleteButton, ImportModel, StartDownloadButton } from "@/components/features/cards/card-model-buttons"
import { useModelDownloader } from "@/components/features/downloader/hook-model-downloader"

interface I_Props {
  title: string
  id: string
  description: string | undefined
  fileSize: number | undefined
  ramSize?: number
  licenses: string[] | undefined
  provider: string | undefined
  icon?: any
  className?: string
  onDownloadComplete?: (success: boolean) => void
}

export const ModelCard = ({ title, id, description, fileSize, ramSize, licenses, provider, className, onDownloadComplete = (success) => success }: I_Props) => {
  const [disabled, setDisabled] = useState(false)

  // Downloader Hook
  const {
    // downloadProgress,
    // progressState,
    importDownload,
    startDownload,
    // pauseDownload,
    cancelDownload,
    deleteDownload,
  } = useModelDownloader()

  const loadRemoveMenu = (
    <div className="flex flex-row gap-4">
      {/* <LoadButton isLoaded={isLoaded} action={() => onSelectModel(id)} /> */}
      <DeleteButton action={deleteDownload} />
    </div>
  )

  const cancelProgressMenu = (
    <div className="flex flex-row gap-4">
      <CancelDownloadButton action={cancelDownload} />
      {/* <DownloadProgressBar /> */}
    </div>
  )

  const downloadImportMenu = (
    <div className="flex flex-row gap-4">
      <StartDownloadButton
        action={async (resume?: boolean) => {
          // Disable button while downloading
          setDisabled(true)
          const success = await startDownload(resume)
          setDisabled(false)
          return success
        }}
        onComplete={onDownloadComplete}
        disabled={disabled}
      />
      <ImportModel
        action={async path => {
          // Disable button while importing
          setDisabled(true)
          const success = await importDownload(path)
          setDisabled(false)
          return success
        }}
        onComplete={onDownloadComplete}
        disabled={disabled}
      />
    </div>
  )

  const renderDownloadPane = () => {
    return loadRemoveMenu
    // if (modelConfig?.validation === EValidationState.Fail) return cancelProgressMenu
    // if (progressState === EProgressState.None && downloadProgress === 0) return downloadImportMenu
    // return inProgressMenu
  }

  return (
    <div className="flex flex-col items-stretch justify-start gap-6 rounded-md border border-gray-300 p-6 dark:border-neutral-800 dark:bg-zinc-900 lg:flex-row">
      {/* Info/Stats */}
      <div className="inline-flex w-full shrink-0 flex-col items-stretch justify-start gap-2 break-words p-0 lg:w-72">
        <h1 className="mb-2 text-left text-xl leading-tight">{title}</h1>
        <p className="text-md truncate text-left">Disk: {fileSize} Gb</p>
        {ramSize && <p className="truncate text-left text-sm">RAM: {ramSize} Gb</p>}
        <p className="truncate text-left text-sm">Provider: {provider}</p>
        <p className="truncate text-left text-sm">License: {licenses?.join(', ')}</p>
      </div>
      {/* Description & Load */}
      <div className="grow-1 inline-flex w-full flex-col items-stretch justify-between gap-4 p-0">
        <div className="h-48 overflow-hidden">
          {/* Text */}
          <p className="h-full overflow-hidden leading-normal">{description}</p>
          {/* Text Gradient Overlay, "bottom-[n]" must match "h-[n]" of parent container */}
          <div className="relative h-full">
            <div className="absolute bottom-48 left-0 h-full w-full bg-gradient-to-t from-zinc-900 from-10% to-transparent to-35%"></div>
          </div>
        </div>
        {/* Load | Download | Progress */}
        <div className="mb-0 mt-auto">{renderDownloadPane()}</div>
      </div>
    </div>
  )
}
