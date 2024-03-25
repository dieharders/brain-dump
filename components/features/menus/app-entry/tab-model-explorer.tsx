import { useCallback, useEffect, useMemo, useState } from 'react'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus, IconDownload, IconClose } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons"
import { T_ModelConfig } from '@/lib/homebrew'
import { calcFileSize, cn } from '@/lib/utils'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  data: { [key: string]: T_ModelConfig }
  onOpenDirAction: () => Promise<void>
  fetchModelInfo: (repoId: string) => Promise<any>
  installedModelsInfo: Array<{ [key: string]: any }>
  downloadModel: ({ repo_id, filename }: { repo_id: string, filename: string }) => Promise<void>
  deleteModel: ({ repoId, filename }: { repoId: string, filename: string }) => Promise<void>
}

export const ModelExplorerMenu = ({
  data,
  Header,
  Title,
  Description,
  onOpenDirAction,
  fetchModelInfo,
  installedModelsInfo,
  downloadModel,
  deleteModel,
}: I_Props) => {
  const modelsList = useMemo(() => Object.values(data) || [], [data])
  const [hfModelsInfo, setHFModelsInfo] = useState<any[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [expandLeftMenu, setExpandLeftMenu] = useState(true)
  const selectedModelConfig = data[selectedModelId || '']
  const numQuants = useMemo(() => {
    const model = hfModelsInfo.find(i => i.id === selectedModelConfig?.repoId)
    const quants = model?.siblings?.filter((s: any) => s.lfs)
    return quants?.length
  }, [hfModelsInfo, selectedModelConfig])
  const rightContainerWidth = selectedModelId ? 'w-full' : 'w-0'
  const rightContainerBorder = selectedModelId ? 'border border-primary/40' : ''
  const noBreakStyle = 'text-ellipsis whitespace-nowrap text-nowrap'
  const contentContainerGap = selectedModelId && expandLeftMenu ? 'gap-6' : ''
  const leftMenuIsExpanded = expandLeftMenu ? 'w-full' : 'w-0 overflow-hidden'

  const renderQuants = useCallback(() => {
    const QuantContainer = ({ fileName, name, fileSize, repo_id }: { fileName: string, name: string, fileSize: string, repo_id: string }) => {
      const [isDownloading, setIsDownloading] = useState(false)
      const installInfo = installedModelsInfo.find(i => i.repoId === repo_id)
      const [isCached, setIsCached] = useState(installInfo?.savePath?.[fileName])

      return (
        <div className={cn("flex h-full flex-row justify-between gap-4 border-t border-dashed border-t-primary/50 bg-background p-4", noBreakStyle)}>
          {/* Quant name */}
          <div className="flex items-center justify-center gap-1 rounded-md border border-primary/50 bg-muted p-2 text-primary/50">
            Quantization<p className="text-primary">{name}</p>
          </div>
          {/* File name */}
          <p className="w-full items-center self-center overflow-hidden text-ellipsis whitespace-nowrap text-primary">{fileName}</p>
          <div className="flex w-fit justify-end gap-2">
            {/* File Size */}
            <div className="flex items-center rounded-md bg-accent/50 p-2 text-primary">{fileSize}GB</div>
            {!isCached ? (
              // Download Model Button
              <Button
                variant="outline"
                disabled={isDownloading}
                onClick={async () => {
                  setIsDownloading(true)
                  await downloadModel({ filename: fileName || '', repo_id })
                  setIsDownloading(false)
                  setIsCached(true)
                  return
                }}
                className="flex h-fit flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-accent"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Download<IconDownload className="h-fit w-4" />
              </Button>
            ) : (
              // Delete Model Button
              <Button
                variant="outline"
                disabled={isDownloading}
                onClick={async () => {
                  setIsDownloading(true)
                  await deleteModel({ filename: fileName || '', repoId: repo_id })
                  setIsDownloading(false)
                  setIsCached(false)
                  return
                }}
                className="flex h-fit flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-red-500 hover:text-red-100"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Delete<IconClose className="h-fit w-4" />
              </Button>
            )}
          </div>
        </div>
      )
    }

    const model = hfModelsInfo.find(i => i.id === selectedModelConfig?.repoId)
    const quants = model?.siblings?.filter((s: any) => s?.lfs)
    return quants?.map((q: any) => {
      const splitName = q?.rfilename.split('.')
      const nameLen = splitName.length - 1
      const name = splitName?.[nameLen - 1]
      const fileName = q?.rfilename
      const byteSize = parseInt(q?.lfs?.size, 10)
      const fileSize = calcFileSize(byteSize)
      const fileSizeString = fileSize.toString().slice(0, 4)
      return <QuantContainer
        key={fileName}
        fileName={fileName}
        fileSize={fileSizeString}
        name={name}
        repo_id={model?.id}
      />
    })
  }, [deleteModel, downloadModel, installedModelsInfo, hfModelsInfo, selectedModelConfig])

  // Get model info for our curated list
  useEffect(() => {
    modelsList?.forEach(async (m) => {
      const info = await fetchModelInfo(m.repoId)

      // @TODO We may want to cache this info data along with the installed_model or model_configs data
      setHFModelsInfo(prev => {
        prev.push(info.data)
        return prev
      })
    })
  }, [fetchModelInfo, modelsList])

  return (
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content Container */}
      <div className={cn("flex flex-col items-start justify-items-stretch overflow-hidden xl:flex-row", contentContainerGap)}>
        {/* Left Content Menu */}
        <div className={cn("flex flex-col justify-items-stretch gap-4", leftMenuIsExpanded)}>
          <div className="flex flex-row gap-2">
            <ModelCard
              title="Add New"
              id="new"
              Icon={IconPlus}
              expandable={false}
              onClick={() => {
                // @TODO Open a menu to add a custom model config
                // ...
              }}
            />
            <ModelCard
              title="Manage Models"
              id="openDir"
              Icon={IconDownload}
              expandable={false}
              onClick={() => {
                // Open the directory where models are saved
                onOpenDirAction()
              }}
            />
          </div>
          {modelsList?.map(i => {
            const modelInfo = hfModelsInfo.find(info => info.id === i.repoId)
            const modelType = modelInfo?.config?.model_type

            return (
              <ModelCard
                key={i.repoId}
                title={i.name}
                id={i.repoId}
                description={i.description}
                downloads={modelInfo?.downloads}
                type={modelType}
                provider={modelInfo?.author}
                libraryName={modelInfo?.library_name}
                tags={modelInfo?.tags}
                // licenses={i.licenses}
                onClick={() => {
                  setSelectedModelId(i.repoId)
                  setExpandLeftMenu(true)
                }}
              />
            )
          }
          )}
        </div>
        {/* Right Content Menu */}
        <div className={cn("order-first flex flex-col justify-items-stretch overflow-hidden rounded-md bg-accent xl:order-last", rightContainerWidth, rightContainerBorder)}>
          <div className={cn("flex h-fit flex-row items-stretch justify-between justify-items-start gap-4 bg-primary/30 p-4", noBreakStyle)}>
            {/* Expand/Collapse Button */}
            <Button
              className="h-fit w-fit"
              variant="secondary"
              onClick={() => { setExpandLeftMenu(prev => !prev) }}
            >
              {expandLeftMenu ? <PinLeftIcon className="h-4 w-4" /> : <PinRightIcon className="h-4 w-4" />}
            </Button>
            <div className="flex w-full flex-col justify-items-start self-center overflow-hidden text-left">
              {modelsList?.find(i => i.repoId === selectedModelId)?.name}
            </div>
            <Button
              className={cn("w-fit self-center", noBreakStyle)}
              variant="secondary"
              onClick={() => {
                const m = modelsList?.find(i => i.repoId === selectedModelId)
                const modelUrl = `https://huggingface.co/${m?.repoId}`
                m && window?.open(modelUrl, '_blank')
              }}
            >Model Card 🤗</Button>
          </div>
          <div className={cn("h-fit p-4 text-accent", noBreakStyle)}>Files Available ({numQuants})</div>
          {renderQuants()}
        </div>
      </div>
    </div>
  )
}
