import { PersonIcon } from '@radix-ui/react-icons'
import { ModelCard } from '@/components/features/cards/card-model'
import { IconPlus } from '@/components/ui/icons'
import { T_ModelConfig } from '@/lib/homebrew'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  AddItem: React.FC<{ title: string, Icon: any, className?: string }>
  className: string
  data: { [key: string]: T_ModelConfig }
}

export const ModelExplorerMenu = ({ data, Header, Title, Description, AddItem, className }: I_Props) => {
  const presetBotClass = "opacity-40"
  const modelsList = Object.values(data)

  return (
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content */}
      <div className={className}>
        <AddItem title="Add New" Icon={IconPlus} />
        {modelsList?.map(i => <ModelCard
          key={i.id}
          title={i.name}
          id={i.id}
          description={i.description}
          fileSize={i.fileSize}
          licenses={i.licenses}
          provider={i.provider}
          icon={PersonIcon}
          className={presetBotClass}
        />)}
      </div>
    </div>
  )
}
