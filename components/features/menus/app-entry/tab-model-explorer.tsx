import { useState } from 'react'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus } from '@/components/ui/icons'
import { T_ModelConfig } from '@/lib/homebrew'
import { cn } from '@/lib/utils'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  // AddItem: React.FC<{ title: string, Icon: any, className?: string }>
  className?: string
  data: { [key: string]: T_ModelConfig }
}

export const ModelExplorerMenu = ({ data, Header, Title, Description, className }: I_Props) => {
  const modelsList = Object.values(data)
  // @TODO Use selectedModel to load quantization data in right menu window
  const [selectedModel, setSelectedModel] = useState('')

  return (
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content */}
      <div className={cn("flex flex-col justify-items-center gap-4", className)}>
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
            onClick={() => setSelectedModel(i.id)}
          />
        )}
      </div>
    </div>
  )
}
