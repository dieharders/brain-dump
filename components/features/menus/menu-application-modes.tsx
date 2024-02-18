'use client'

import { useCallback, useState } from 'react'
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/load-playground'
import { cn } from '@/lib/utils'

interface I_Props {
  onSubmit: () => void
  services: any
  modelConfigs: any
  installedList: any
  setCurrentTextModel: any
  isConnecting: any
  setIsConnecting: any
  setHasTextServiceConnected: any
}

const Header = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left my-8">{children}</div>

const Title = ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>

const Description = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground mb-4">{children}</p>

const Item = ({ title, onAction, Icon }: { title?: string, onAction?: () => void, Icon: any }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        onClick={onAction}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          `h-12 w-12 rounded-full bg-background p-0 cursor-pointer`,
        )}
      >
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <div className="text-sm text-center text-muted-foreground">{title}</div>
    </div>
  )
}

export const ApplicationModesMenu = (props: I_Props) => {
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined)

  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting, services, installedList, modelConfigs, setCurrentTextModel } = props

  const onSave = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const onTabChange = useCallback(
    (val: string) => {
      console.log('@@ tab', val);
    },
    [],
  )

  // Menus
  const botsMenu = (
    <div className="px-1">
      <Header>
        <Title>Bots</Title>
        <Description>
          Personalized Ai with unique knowledge and expertise in a specific domain. Ask questions or provide instructions and they will return text, images, or video as part of a conversation.
        </Description>
      </Header>

      {/* Content */}
      <div className="w-full flex flex-row justify-between items-start gap-2">
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Instruct" Icon={QuestionMarkIcon} />
        <Item title="Conversational" Icon={IconConversationType} />
        <Item title="Assistant" Icon={ClipboardIcon} />
        <Item title="Agent" Icon={PersonIcon} />
      </div>
    </div>
  )

  const assistantsMenu = (
    <div className="px-1">
      <Header>
        <Title>Assistants</Title>
        <Description>
          Organize several bots to create a deliverable. Submit a complex job to perform and get a result back over time.
        </Description>
      </Header>

      {/* Content */}
      <div className="w-full flex flex-row justify-between items-start gap-2">
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Academic" Icon={QuestionMarkIcon} />
        <Item title="Entertainment" Icon={IconConversationType} />
        <Item title="Developer" Icon={ClipboardIcon} />
        <Item title="Writer" Icon={PersonIcon} />
        <Item title="Lawyer" Icon={PersonIcon} />
      </div>
    </div>
  )

  const crewsMenu = (
    <div className="px-1">
      <Header>
        <Title>Crews</Title>
        <Description>
          A group of assistants working together towards a goal and motivated by rewards. Submit a goal to achieve with the deadline and criteria to meet that goal. Many results are returned over time until the goal is met.
        </Description>
      </Header>

      {/* Content */}
      <div className="w-full flex flex-row justify-between items-start gap-2">
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Publisher" Icon={QuestionMarkIcon} />
        <Item title="Game Studio" Icon={IconConversationType} />
        <Item title="Quality Assurance" Icon={ClipboardIcon} />
        <Item title="Software Team" Icon={PersonIcon} />
      </div>
    </div>
  )

  const knowledgeMenu = (
    <div className="px-1">
      <Header>
        <Title>Knowledge Base</Title>
        <Description>
          Add and edit documents (text, images, video, audio) to be retrieved from the vector database when you require specialized knowledge to be used by bots.
        </Description>
      </Header>

      {/* Content */}
      <div className="w-full flex flex-row justify-between items-start gap-2">
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Documentation" Icon={QuestionMarkIcon} />
        <Item title="Best Practices" Icon={IconConversationType} />
        <Item title="Code Repo" Icon={ClipboardIcon} />
        <Item title="Contacts" Icon={PersonIcon} />
        <Item title="Notes" Icon={PersonIcon} />
      </div>
    </div>
  )

  const modelsMenu = (
    <div className="px-1">
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content */}
      <div className="w-full flex flex-row justify-between items-start gap-2">
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Llama 2 13B" Icon={QuestionMarkIcon} />
        <Item title="Wizard Vicuna" Icon={IconConversationType} />
        <Item title="Mistral 7B" Icon={ClipboardIcon} />
        <Item title="Mixtral 8x7B" Icon={PersonIcon} />
        <Item title="Code Llama" Icon={PersonIcon} />
      </div>
    </div>
  )

  const playgroundMenu = (
    <>
      <div className="px-1">
        <Header>
          <Title>Ai Playground</Title>
          <Description>
            Choose an Ai model and fully customize its' config, then drop into a chat session. Explore chat settings and experiment with prompting techniques before setting off to create your own personalized bots.
          </Description>
        </Header>

        {/* Content */}
        <div className="w-full flex flex-row justify-between items-start gap-2">
          {/* Choose model to load */}
          <Playground setHasTextServiceConnected={setHasTextServiceConnected} setSelectedModelId={setSelectedModelId} isConnecting={isConnecting} setIsConnecting={setIsConnecting} selectedModelId={selectedModelId} setCurrentTextModel={setCurrentTextModel} services={services} installedList={installedList} modelConfigs={modelConfigs} />
        </div>
      </div>
    </>
  )

  const tabs = [
    { label: 'models', content: modelsMenu },
    { label: 'playground', content: playgroundMenu },
    { label: 'bots', content: botsMenu },
    { label: 'assistants', content: assistantsMenu },
    { label: 'crews', content: crewsMenu },
    { label: 'knowledge', content: knowledgeMenu },
  ]

  return (
    <Tabs label="Application Modes" tabs={tabs} onChange={onTabChange} />
  )
}
