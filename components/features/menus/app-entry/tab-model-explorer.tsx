import { PersonIcon } from '@radix-ui/react-icons'
import { IconPlus } from '@/components/ui/icons'
import { T_ModelConfig } from '@/lib/homebrew'

type T_Component = React.FC<{ children: React.ReactNode }>
interface I_Props {
  Header: T_Component
  Title: T_Component
  Description: T_Component
  Item: React.FC<{ title: string, Icon: any, className?: string }>
  className: string
  data: { [key: string]: T_ModelConfig }
}

export const ModelExplorerMenu = ({ data, Header, Title, Description, Item, className }: I_Props) => {
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
        <Item title="Add New" Icon={IconPlus} />
        {modelsList?.map(i => <Item key={i.id} title={i.name} Icon={PersonIcon} className={presetBotClass} />)}
      </div>
    </div>
  )
}
