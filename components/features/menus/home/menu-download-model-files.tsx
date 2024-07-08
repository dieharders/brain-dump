'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'
import { IconDownload, IconClose } from '@/components/ui/icons'
import { calcFileSize, cn } from '@/lib/utils'
import { T_ModelConfig } from '@/lib/homebrew'
import { Select } from '@/components/ui/select'
import { useActions } from './actions'
import { useGlobalContext } from '@/contexts'

const qDescr: { [key: string]: string } = {
  Q2_K: 'smallest, significant quality loss - not recommended for most purposes',
  Q3_K_S: 'very small, high quality loss',
  Q3_K_M: 'very small, high quality loss',
  Q3_K_L: 'small, substantial quality loss',
  Q4_0: 'legacy; small, very high quality loss - prefer using Q3_K_M',
  Q4_K_S: 'small, greater quality loss',
  Q4_K_M: 'medium, balanced quality - recommended',
  Q5_0: 'legacy; medium, balanced quality - prefer using Q4_K_M',
  Q5_K_S: 'large, low quality loss - recommended',
  Q5_K_M: 'large, very low quality loss - recommended',
  Q6_K: 'very large, extremely low quality loss',
  Q8_0: 'very large, extremely low quality loss - not recommended'
}

interface I_Props {
  id: string
  data: { [key: string]: T_ModelConfig }
  installedModelsInfo: Array<{ [key: string]: any }>
  hfModelsInfo: Array<any>
  downloadModel: ({ repo_id, filename }: { repo_id: string, filename: string }) => Promise<void>
  deleteModel: ({ repoId, filename }: { repoId: string, filename: string }) => Promise<void>
  modelsList: Array<any>
}

export const DownloadModelMenu = (props: I_Props) => {
  const {
    id,
    data,
    installedModelsInfo,
    hfModelsInfo,
    downloadModel,
    deleteModel,
    modelsList,
  } = props
  const { services } = useGlobalContext()
  const { fetchInstalledModelsAndConfigs } = useActions()
  const selectedModelConfig = data[id || '']
  const numQuants = useMemo(() => {
    const model = hfModelsInfo.find?.(i => i.id === selectedModelConfig?.repoId)
    const quants = model?.siblings?.filter((s: any) => s.lfs)
    return quants?.length
  }, [hfModelsInfo, selectedModelConfig])
  const model = hfModelsInfo.find?.(i => i.id === selectedModelConfig?.repoId)
  const quants = model?.siblings?.filter((s: any) => s?.lfs)
  const [selected, setSelected] = useState<string>(quants?.[0]?.rfilename)
  const noBreakStyle = 'text-ellipsis whitespace-nowrap text-nowrap'

  const renderQuants = useCallback(() => {
    const QuantContainer = ({ fileName, name, fileSize, repo_id }: { fileName: any, name: string, fileSize: string, repo_id: string }) => {
      const [isDownloading, setIsDownloading] = useState(false)
      const installInfo = installedModelsInfo.find(i => i.repoId === repo_id)
      const [isCached, setIsCached] = useState(installInfo?.savePath?.[fileName])
      const quantItems = quants?.map((i: any) => ({ name: i.rfilename, value: i.rfilename }))
      const sizeGB = fileSize === 'NaN' ? '0' : fileSize

      return (
        <div className={cn("flex h-full flex-col justify-between gap-4 border-t border-dashed border-t-muted-foreground bg-background p-4", noBreakStyle)}>
          {/* File name */}
          <div className="w-full gap-1 truncate rounded-md border border-muted-foreground bg-muted p-2 text-muted-foreground">
            <Select id="select_model_file" name={fileName} value={fileName} placeholder="Select a file" onChange={setSelected} items={quantItems} className="w-full border-none bg-accent text-primary shadow-none" />
          </div>
          {/* Use-Case Description */}
          <p className="w-full items-center self-center whitespace-normal text-muted-foreground">
            {name === '1' || name === 'NaN' ? 'No information is available for this file.' : name ? qDescr?.[name] : 'Please select a file to download.'}
          </p>
          {/* Footer and download button */}
          <div className="flex w-full flex-col justify-end gap-2 sm:flex-row">
            {/* File Size */}
            <div className="flex items-center justify-center rounded-md bg-accent/50 p-2 text-center text-primary">{sizeGB}GB</div>
            {/* Quant name */}
            {name && name.length > 1 && <div className="flex items-center justify-center rounded-md bg-accent/50 p-2 text-center text-primary">{name}</div>}
            {!isCached ? (
              // Download Model Button
              <Button
                variant="outline"
                disabled={isDownloading || !fileName}
                onClick={async () => {
                  setIsDownloading(true)
                  await downloadModel({ filename: fileName || '', repo_id })
                  setIsDownloading(false)
                  setIsCached(true)
                  // Update installed models list
                  fetchInstalledModelsAndConfigs()
                  return
                }}
                className="flex h-fit flex-1 flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-accent"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Download<IconDownload className="h-full w-4" />
              </Button>
            ) : (
              // Delete Model Button
              <Button
                variant="outline"
                disabled={isDownloading || !fileName}
                onClick={async () => {
                  setIsDownloading(true)
                  await deleteModel({ filename: fileName || '', repoId: repo_id })
                  setIsDownloading(false)
                  setIsCached(false)
                  return
                }}
                className="flex h-fit flex-1 flex-row items-center gap-1 rounded-md p-2 text-lg text-primary hover:bg-red-500 hover:text-red-100"
              >
                {isDownloading && <IconSpinner className="mr-2 animate-spin" />}
                Delete<IconClose className="h-fit w-4" />
              </Button>
            )}
          </div>
        </div>
      )
    }
    const quant = quants?.find((q: any) => q.rfilename === selected)
    const splitName = quant?.rfilename.split('.')
    const nameLen = splitName?.length - 1
    const name = splitName?.[nameLen - 1]
    const fileName = quant?.rfilename
    const byteSize = parseInt(quant?.lfs?.size, 10)
    const fileSize = calcFileSize(byteSize)
    const fileSizeString = fileSize.toString().slice(0, 4)

    return <QuantContainer
      key={fileName}
      fileName={fileName}
      fileSize={fileSizeString}
      name={name}
      repo_id={model?.id}
    />
  }, [quants, model?.id, installedModelsInfo, downloadModel, fetchInstalledModelsAndConfigs, services, deleteModel, selected])

  return (
    <div className="order-last flex w-full flex-col justify-items-stretch overflow-hidden rounded-md border border-primary/40 bg-accent">
      <div className={cn("flex h-fit flex-row items-stretch justify-between justify-items-start gap-4 bg-primary/30 p-4", noBreakStyle)}>
        <div className="flex w-full flex-col justify-items-start self-center overflow-hidden text-left">
          {modelsList?.find(i => i.repoId === id)?.name}
        </div>
        <Button
          className={cn("w-fit self-center", noBreakStyle)}
          variant="secondary"
          onClick={() => {
            const m = modelsList?.find(i => i.repoId === id)
            const modelUrl = `https://huggingface.co/${m?.repoId}`
            m && window?.open(modelUrl, '_blank')
          }}
        >Model Card 🤗</Button>
      </div>
      <div className={cn("h-fit p-4 text-accent", noBreakStyle)}>Files Available ({numQuants})</div>
      {renderQuants()}
    </div>
  )
}
