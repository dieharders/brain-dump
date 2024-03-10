import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus } from '@/components/ui/icons'
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
}

export const ModelExplorerMenu = ({ data, Header, Title, Description }: I_Props) => {
  const modelsList = Object.values(data)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [expandLeftMenu, setExpandLeftMenu] = useState(true)
  const selectedModelConfig = data[selectedModelId || '']
  const rightContainerWidth = selectedModelId ? 'w-full' : 'w-0'
  const rightContainerBorder = selectedModelId ? 'border border-primary/40' : ''
  const noBreakStyle = 'text-ellipsis whitespace-nowrap text-nowrap'
  const contentContainerGap = selectedModelId && expandLeftMenu ? 'gap-6' : ''
  const leftMenuIsExpanded = expandLeftMenu ? 'w-full' : 'w-0 overflow-hidden'
  const router = useRouter()

  return (
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content Container */}
      <div className={cn("flex flex-row items-start justify-items-stretch overflow-hidden", contentContainerGap)}>
        {/* Left Content Menu */}
        <div className={cn("flex flex-col justify-items-stretch gap-4", leftMenuIsExpanded)}>
          <ModelCard
            title={expandLeftMenu ? "Add New" : ""}
            id="new"
            Icon={IconPlus}
            expandable={false}
            onClick={() => {
              // @TODO Open a menu to add a custom model config
              // ...
            }}
          />
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
        <div className={cn("flex flex-col justify-items-stretch gap-1 overflow-hidden rounded-md bg-accent", rightContainerWidth, rightContainerBorder)}>
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
          <div className={cn("h-fit p-4 text-accent", noBreakStyle)}>Quantizations Available (12)</div>
          {/* List of Quants */}
          <div className={cn("h-fit border-t border-dashed border-t-primary/50 bg-background p-4", noBreakStyle)}>
            {/* Quant name */}
            {selectedModelConfig?.name}
            {/* Size */}
            {/* Download Button */}
          </div>
        </div>
      </div>
    </div>
  )
}
