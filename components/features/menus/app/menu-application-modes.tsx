'use client'

import { useCallback, useState } from 'react'
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/app/load-playground'
import { BotCreationMenu } from '@/components/features/menus/bots/menu-create-bot'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { T_InstalledTextModel, T_ModelConfig } from '@/lib/homebrew'

interface I_Props {
  onSubmit: () => void
  services: any
  modelConfigs: { [key: string]: T_ModelConfig }
  installedList: T_InstalledTextModel[]
  setCurrentTextModel: any
  isConnecting: any
  setIsConnecting: any
  setHasTextServiceConnected: any
}

const Header = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left my-8">{children}</div>

const Title = ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>

const Description = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground mb-4">{children}</p>

const Item = ({ title, onAction, Icon, className }: { title?: string, onAction?: () => void, Icon: any, className?: string }) => {
  return (
    <div className={`h-[10rem] w-[10rem] flex flex-col items-center justify-center gap-2 bg-accent rounded-md p-2 ${className}`}>
      <div
        onClick={onAction}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          `h-[50%] w-[50%] rounded-full bg-background p-0 cursor-pointer focus:outline-none outline-3 hover:outline-dashed outline-offset-0 outline-muted-foreground`,
        )}
      >
        <Icon className="h-[50%] w-[50%] text-foreground" />
      </div>
      <div className="w-full text-md text-center text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{title}</div>
    </div>
  )
}

export const ApplicationModesMenu = (props: I_Props) => {
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined)
  const gridContentClass = "flex flex-wrap justify-around gap-6"
  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting, services, installedList, modelConfigs, setCurrentTextModel } = props
  const [openBotCreationMenu, setOpenBotCreationMenu] = useState(false)

  const onSelect = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const onTabChange = useCallback(
    (val: string) => {
      console.log('@@ tab', val);
    },
    [],
  )

  const placeholderItems = () => {
    const list = []
    for (let index = 0; index < 13; index++) {
      const el = <Item key={index} title="...." Icon={QuestionMarkIcon} className="opacity-40" />
      list.push(el)
    }
    return list
  }

  const createNewBotAction = () => {
    // show bot creation menu
    setOpenBotCreationMenu(true)
    // ###
    // - Model pulldown selector
    // - Attention type (conversation, instruct, rolling)
    // - Customize model performance settings
    // - Use trained data or RAG data, if RAG then select an index source and retrieval method
    // - Customize system message (personality), only shown if "promptFormat" in modelConfig includes "system_str"
    // - Customize prompt template (thinking, structured response types), only shown if RAG is disabled -OR- RAG memory template, only shown if RAG is enabled
    // - Customize model config settings (Response, temperature, etc)

    console.log('@@ show bot creation menu');
  }

  const saveBotConfig = useCallback((settings: any) => {
    toast.success('New bot created!')
    console.log('@@ bot saved settings', settings);
    // @TODO Update this menu's list of items
    // ...
    // save menu forms to a json file under 'settings/app.json'
    // ...
  }, [])

  // Menus
  const botsMenu = (
    <div>
      {/* Menu for bot creation */}
      <BotCreationMenu
        dialogOpen={openBotCreationMenu}
        setDialogOpen={setOpenBotCreationMenu}
        onSubmit={saveBotConfig}
        data={{ modelConfigs, installedList, services }}
      />
      {/* Title and description */}
      <Header>
        <Title>Bots</Title>
        <Description>
          Personalized Ai with unique knowledge and expertise in a specific domain. Ask questions or provide instructions and they will return text, images, or video as part of a conversation.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={createNewBotAction} />
        <Item title="Language Expert" Icon={QuestionMarkIcon} onAction={onSelect} />
        <Item title="Coding Chatbot" Icon={IconConversationType} />
        <Item title="Logical Thinker" Icon={ClipboardIcon} />
        <Item title="Mathematician" Icon={PersonIcon} />
        <Item title="Historical Scholar" Icon={PersonIcon} />
        {placeholderItems()}
      </div>
    </div>
  )

  const assistantsMenu = (
    <div>
      <Header>
        <Title>Assistants</Title>
        <Description>
          Organize several bots to create a deliverable. Submit a complex job to perform and get a result back over time.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Stock Analyst" Icon={QuestionMarkIcon} />
        <Item title="Entertainer" Icon={IconConversationType} />
        <Item title="Software Developer" Icon={ClipboardIcon} />
        <Item title="Sci-Fi Author" Icon={PersonIcon} />
        <Item title="Lawyer" Icon={PersonIcon} />
        {placeholderItems()}
      </div>
    </div>
  )

  const crewsMenu = (
    <div>
      <Header>
        <Title>Company of Assistants</Title>
        <Description>
          A group of assistants working together towards a goal and motivated by rewards. Submit a goal to achieve with a deadline and criteria to meet that goal. Several results are returned over time by individual assistants and collected into a report by a designated "CEO" assistant until the goal is met.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Publisher" Icon={QuestionMarkIcon} />
        <Item title="Game Studio" Icon={IconConversationType} />
        <Item title="Quality Assurance" Icon={ClipboardIcon} />
        <Item title="Software Team" Icon={PersonIcon} />
        {placeholderItems()}
      </div>
    </div>
  )

  const knowledgeMenu = (
    <div>
      <Header>
        <Title>Knowledge Base</Title>
        <Description>
          Add and edit documents (text, images, video, audio) to be retrieved from the vector database when you require specialized knowledge to be used by bots.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
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
    <div>
      <Header>
        <Title>Ai Model Explorer</Title>
        <Description>
          Browse and install thousands of Ai models to power your bots. Each model can be confgured to meet your hardware needs. A recommended list of models is curated by the team.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
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
      <div>
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
    { label: 'teams', content: crewsMenu },
    { label: 'knowledge', content: knowledgeMenu },
  ]

  return (
    <Tabs label="Application Modes" tabs={tabs} onChange={onTabChange} />
  )
}
