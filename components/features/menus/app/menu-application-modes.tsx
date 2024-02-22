'use client'

import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/app/tab-playground'
import { BotCreationMenu, I_Settings } from '@/components/features/menus/bots/menu-create-bot'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel } from '@/lib/homebrew'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface I_Props {
  onSubmit: () => void
  services: I_ServiceApis | null
  modelConfigs: I_ModelConfigs
  installedList: T_InstalledTextModel[]
  isConnecting: boolean
  setIsConnecting: Dispatch<SetStateAction<boolean>>
  setHasTextServiceConnected: Dispatch<SetStateAction<boolean>>
}

const Header = ({ children }: { children: React.ReactNode }) => <div className="my-8 flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>

const Title = ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>

const Description = ({ children }: { children: React.ReactNode }) => <p className="mb-4 text-sm text-muted-foreground">{children}</p>

const Item = ({ title, onAction, Icon, className }: { title?: string, onAction?: () => void, Icon: any, className?: string }) => {
  return (
    <div className={`flex h-[10rem] w-[10rem] flex-col items-center justify-center gap-2 rounded-md bg-accent p-2 ${className}`}>
      <div
        onClick={onAction}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          `outline-3 h-[50%] w-[50%] cursor-pointer rounded-full bg-background p-0 outline-offset-0 outline-muted-foreground hover:outline-dashed focus:outline-none`,
        )}
      >
        <Icon className="h-[50%] w-[50%] text-foreground" />
      </div>
      <div className="text-md w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-muted-foreground">{title}</div>
    </div>
  )
}

export const ApplicationModesMenu = (props: I_Props) => {
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined)
  const gridContentClass = "flex flex-wrap justify-around gap-6"
  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting, services, installedList, modelConfigs } = props
  const [openBotCreationMenu, setOpenBotCreationMenu] = useState(false)

  const onSelect = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const onTabChange = useCallback(
    (_val: string) => {
      // console.log('@@ tab', val)
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
  }

  const saveBotConfig = useCallback((settings: I_Settings) => {
    toast.success('New bot created!')
    console.log('@@ bot saved settings', settings)
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
        <Item title="Bio Researcher" Icon={PersonIcon} />
        {placeholderItems()}
      </div>
    </div>
  )

  const crewsMenu = (
    <div>
      <Header>
        <Title>Team of Assistants</Title>
        <Description>
          {`A group of assistants working together towards a goal and motivated by rewards. Submit a goal to achieve with a deadline and criteria to meet that goal. Several results are returned over time by individual assistants and collected into a report by a designated "CEO" assistant until the goal is met.`}
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} />
        <Item title="Publisher" Icon={QuestionMarkIcon} />
        <Item title="Game Studio" Icon={IconConversationType} />
        <Item title="Advertising Company" Icon={PersonIcon} />
        <Item title="Quality Assurance" Icon={ClipboardIcon} />
        <Item title="Software Team" Icon={PersonIcon} />
        <Item title="Research Org" Icon={PersonIcon} />
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
    <div>
      <Header>
        <Title>Ai Playground</Title>
        <Description>
          {`Choose an Ai model and fully customize its' config, then drop into a chat session. Explore chat settings and experiment with prompting techniques before setting off to create your own personalized bots.`}
        </Description>
      </Header>

      {/* Content */}
      <div className="flex w-full flex-row items-start justify-between gap-2">
        {/* Choose model to load */}
        <Playground
          setHasTextServiceConnected={setHasTextServiceConnected}
          setSelectedModelId={setSelectedModelId}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          selectedModelId={selectedModelId}
          services={services}
          installedList={installedList}
          modelConfigs={modelConfigs}
        />
      </div>
    </div>
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
