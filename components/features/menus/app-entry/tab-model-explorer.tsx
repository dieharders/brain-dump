import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
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
  // @TODO Use selectedModel to load quantization data in right menu window
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const selectedModelConfig = data[selectedModelId || '']
  const rightContainerWidth = selectedModelId ? 'w-full' : 'w-0'
  const rightContainerBorder = selectedModelId ? 'border border-primary/40' : ''
  const contentContainerGap = selectedModelId ? 'gap-6' : ''
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
      <div className={cn("flex flex-row items-start justify-items-stretch overflow-hidden transition-all duration-300 ease-in", contentContainerGap)}>
        {/* Left Content Menu */}
        <div className={cn("flex w-full flex-col justify-items-stretch gap-4")}>
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
              onClick={() => setSelectedModelId(i.id)}
            />
          )}
        </div>

        {/* Right Content Menu */}
        <div className={cn("flex flex-col justify-items-stretch gap-1 overflow-hidden rounded-md bg-accent", rightContainerWidth, rightContainerBorder)}>
          <div className="flex h-[4rem] flex-row items-stretch justify-between justify-items-start gap-4 bg-primary/30 p-4">
            {/* Expand/Collapse Button */}
            <Button
              className="h-fit w-fit"
              variant="secondary"
            >💥</Button>
            <div className="self-center justify-self-start text-left">{selectedModelId}</div>
            <Button
              className="w-fit"
              variant="secondary"
              onClick={() => {
                if (selectedModelConfig?.modelUrl?.length && selectedModelConfig?.modelUrl?.length > 0) {
                  router.push(selectedModelConfig.modelUrl)
                }
              }}
            >Model Card 🤗</Button>
          </div>
          <div className="h-fit p-4">Quantizations Available (12)</div>
          <div className="h-fit bg-slate-700 p-4">
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
