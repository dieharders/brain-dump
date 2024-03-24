'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/app-entry/tab-playground'
import { BotCreationMenu } from '@/components/features/menus/app-entry/tab-bots'
import { I_ModelConfigs, I_ServiceApis, I_Text_Settings, T_InstalledTextModel } from '@/lib/homebrew'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { ModelExplorerMenu } from '@/components/features/menus/app-entry/tab-model-explorer'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ROUTE_CHATBOT } from '@/app/constants'

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
  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting, services, installedList, modelConfigs } = props
  const ROUTE_KNOWLEDGE = '/knowledge'
  const { loadModel: loadChatBot } = useChatPage({ services })
  // State
  const router = useRouter()
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined)
  const [openBotCreationMenu, setOpenBotCreationMenu] = useState(false)
  const [bots, setBots] = useState<I_Text_Settings[]>([])
  // Styling
  const gridContentClass = "grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] justify-items-center gap-6"
  const presetBotClass = "opacity-40"
  // Methods
  const modelExploreAction = useCallback(async () => {
    await services?.textInference?.modelExplore()
    return
  }, [services?.textInference])

  const goToKnowledgePage = () => router.push(ROUTE_KNOWLEDGE)

  const fetchBots = useCallback(async () => {
    // Save menu forms to a json file
    const res = await services?.storage.getBotSettings()
    // Update this menu's list of items
    res?.data && setBots(res.data)
  }, [services?.storage])

  const onSelect = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const onTabChange = useCallback(
    (_val: string) => {
      // do stuff here ...
    },
    [],
  )

  const createNewBotAction = () => {
    // show bot creation menu
    setOpenBotCreationMenu(true)
  }

  const saveBotConfig = useCallback((settings: I_Text_Settings) => {
    toast.success('New bot created!')
    const action = async () => {
      // Save menu forms to a json file
      const res = await services?.storage.saveBotSettings({ body: settings })
      // Update this menu's list of items
      res?.data && setBots(res.data)
    }
    action()
  }, [services?.storage])

  const fetchModelInfo = useCallback(
    async (repoId: string) => {
      const payload = { repoId }
      const info = services?.textInference?.getModelInfo({ queryParams: payload })
      return info
    },
    [services?.textInference],
  )

  const downloadModel = useCallback(
    async ({ repo_id, filename }: { repo_id: string, filename: string }) => {
      await services?.textInference.download({ body: { repo_id, filename } })
      return
    },
    [services?.textInference],
  )

  const deleteModel = useCallback(
    async (args: { repoId: string, filename: string }) => {
      // Remove the model weights file and installation details entry from json
      await services?.textInference.delete({ body: args })
      return
    },
    [services?.textInference],
  )

  useEffect(() => {
    fetchBots()
  }, [fetchBots])

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
        {/* Create a bot */}
        <Item title="Add New" Icon={IconPlus} onAction={createNewBotAction} />
        {/* Presets and User generated bots */}
        {...bots.map(bot => {
          const botId = bot.model.botName
          const title = botId[0].toUpperCase() + botId.slice(1)
          const queryParams = `?id=${botId}`
          const pathname = `/${ROUTE_CHATBOT}${queryParams}`
          return (
            <Item key={botId} title={title} Icon={() => <div className="text-4xl">🤖</div>} onAction={async () => {
              if (loadChatBot) {
                setIsConnecting(true)
                // Eject first
                await services?.textInference?.unload()
                // Load model
                await loadChatBot(botId)
                setHasTextServiceConnected(true)
                setIsConnecting(false)
                onSelect()
                router.push(pathname)
              }
            }} />
          )
        }
        )}
        <Item title="Language Expert" Icon={QuestionMarkIcon} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Coding Chatbot" Icon={IconConversationType} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Logical Thinker" Icon={ClipboardIcon} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Mathematician" Icon={PersonIcon} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Historical Scholar" Icon={PersonIcon} onAction={createNewBotAction} className={presetBotClass} />
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
        <Item title="Stock Analyst" Icon={QuestionMarkIcon} className={presetBotClass} />
        <Item title="Entertainer" Icon={IconConversationType} className={presetBotClass} />
        <Item title="Software Developer" Icon={ClipboardIcon} className={presetBotClass} />
        <Item title="Sci-Fi Author" Icon={PersonIcon} className={presetBotClass} />
        <Item title="Lawyer" Icon={PersonIcon} className={presetBotClass} />
        <Item title="Bio Researcher" Icon={PersonIcon} className={presetBotClass} />
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
        <Item title="Publisher" Icon={QuestionMarkIcon} className={presetBotClass} />
        <Item title="Game Studio" Icon={IconConversationType} className={presetBotClass} />
        <Item title="Advertising Company" Icon={PersonIcon} className={presetBotClass} />
        <Item title="Quality Assurance" Icon={ClipboardIcon} className={presetBotClass} />
        <Item title="Software Team" Icon={PersonIcon} className={presetBotClass} />
        <Item title="Research Org" Icon={PersonIcon} className={presetBotClass} />
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
        <Item title="Documentation" Icon={QuestionMarkIcon} className={presetBotClass} onAction={goToKnowledgePage} />
        <Item title="Best Practices" Icon={IconConversationType} className={presetBotClass} onAction={goToKnowledgePage} />
        <Item title="Code Repo" Icon={ClipboardIcon} className={presetBotClass} onAction={goToKnowledgePage} />
        <Item title="Contacts" Icon={PersonIcon} className={presetBotClass} onAction={goToKnowledgePage} />
        <Item title="Notes" Icon={PersonIcon} className={presetBotClass} onAction={goToKnowledgePage} />
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
    {
      label: 'models', icon: "👨‍💻", content: ModelExplorerMenu({
        data: modelConfigs,
        installedModelsInfo: installedList,
        Header,
        Title,
        Description,
        onOpenDirAction: modelExploreAction,
        fetchModelInfo,
        downloadModel,
        deleteModel,
      })
    },
    { label: 'playground', icon: "🌎", content: playgroundMenu },
    { label: 'bots', icon: "🤖", content: botsMenu },
    { label: 'assistants', icon: "👩‍🔬", content: assistantsMenu },
    { label: 'teams', icon: "🙌", content: crewsMenu },
    { label: 'knowledge', icon: "📚", content: knowledgeMenu },
  ]

  return (isConnecting ?
    (
      <div className="mx-auto mt-16 min-w-[50%] max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8">
          <h1 className="mb-2 text-lg font-semibold">
            Loading
          </h1>

          <p className="mb-2 leading-normal text-muted-foreground">
            Please wait while the model loads...
          </p>

          <div className="mt-8 flex flex-col items-start space-y-2">
            <Button
              className="h-auto text-base"
              onClick={() => { setIsConnecting(false) }}
            >Cancel</Button>
          </div>
        </div>
      </div>
    )
    :
    <div className="flex w-full flex-col overflow-hidden p-4 md:w-[70%]">
      <Tabs label="Application Modes" tabs={tabs} onChange={onTabChange} />
    </div>
  )
}
