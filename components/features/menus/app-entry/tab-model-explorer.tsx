import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus, IconDownload } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons"
import { T_ModelConfig } from '@/lib/homebrew'
import { cn } from '@/lib/utils'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  // AddItem: React.FC<{ title: string, Icon: any, className?: string }>
  data: { [key: string]: T_ModelConfig }
  onOpenDirAction: () => Promise<void>
}

export const ModelExplorerMenu = ({ data, Header, Title, Description, onOpenDirAction }: I_Props) => {
  const modelsList = Object.values(data) || []
  const [selectedModelId, setSelectedModelId] = useState<string | null>(modelsList?.[0]?.id || null)
  const [expandLeftMenu, setExpandLeftMenu] = useState(true)
  const selectedModelConfig = data[selectedModelId || '']
  const rightContainerWidth = selectedModelId ? 'w-full' : 'w-0'
  const rightContainerBorder = selectedModelId ? 'border border-primary/40' : ''
  const noBreakStyle = 'text-ellipsis whitespace-nowrap text-nowrap'
  const contentContainerGap = selectedModelId && expandLeftMenu ? 'gap-6' : ''
  const leftMenuIsExpanded = expandLeftMenu ? 'w-full' : 'w-0 overflow-hidden'
  const router = useRouter()

  const QuantContainer = ({ fileName, name, fileSize, action, downloadUrl }: { fileName: string, name: string, fileSize: string, action?: (url: string) => void, downloadUrl?: string }) => {
    return (
      <div className={cn("flex h-full flex-row justify-between gap-4 border-t border-dashed border-t-primary/50 bg-background p-4", noBreakStyle)}>
        {/* Quant name */}
        <div className="flex items-center justify-center gap-1 rounded-md border border-primary/50 bg-muted p-2 text-primary/50">
          Quantization<p className="text-primary">{name}</p>
        </div>
        {/* File name */}
        <p className="w-full items-center self-center overflow-hidden text-ellipsis whitespace-nowrap text-primary">{fileName}</p>
        <div className="flex w-full justify-end gap-2">
          {/* File Size */}
          <div className="flex items-center rounded-md bg-accent/50 p-2 text-primary">{fileSize}GB</div>
          {/* Download Button */}
          <Button
            variant="secondary"
            onClick={() => {
              // @TODO Add api call to download this model
              action && action(downloadUrl || '')
            }}
            className="flex h-fit flex-row items-center gap-1 rounded-md bg-accent/50 p-2 text-lg text-primary"
          >
            Download<IconDownload className="h-fit w-4" />
          </Button>
        </div>
      </div>
    )
  }

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
                // Open the dir where models are saved
                onOpenDirAction()
              }}
            />
          </div>
          {modelsList?.map(i =>
            <ModelCard
              key={i.id}
              title={i.name}
              id={i.id}
              description={i.description}
              fileSize={i.fileSize}
              licenses={i.licenses}
              provider={i.provider}
              fileName={i.fileName}
              onClick={() => {
                setSelectedModelId(i.id)
                setExpandLeftMenu(true)
              }}
            />
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
              {selectedModelId}
            </div>
            <Button
              className={cn("w-fit self-center", noBreakStyle)}
              variant="secondary"
              onClick={() => {
                if (selectedModelConfig?.modelUrl?.length && selectedModelConfig?.modelUrl?.length > 0) {
                  router.push(selectedModelConfig.modelUrl)
                }
              }}
            >Model Card 🤗</Button>
          </div>
          <div className={cn("h-fit p-4 text-accent", noBreakStyle)}>Files Available (12)</div>
          {/* List of Quants, @TODO Make a list of these from a quant list in configs */}
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="4.37" name="Q2_K" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="3.16" name="Q3_K_S" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="3.52" name="Q3_K_M" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="3.82" name="Q3_K_L" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="4.11" name="Q4_0" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="4.14" name="Q4_K_S" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="4.37" name="Q4_K_M" />
          <QuantContainer fileName={selectedModelConfig?.fileName} fileSize="5.00" name="Q5_0" />
        </div>
      </div>
    </div>
  )
}
