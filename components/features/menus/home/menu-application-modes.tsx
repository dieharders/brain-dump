'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { IconConversationType } from '@/components/ui/icons'
import { QuestionMarkIcon, PersonIcon, ClipboardIcon } from '@radix-ui/react-icons'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/home/tab-playground'
import { BotCreationMenu } from '@/components/features/menus/home/tab-bots'
import { I_ModelConfigs, I_ServiceApis, I_Text_Settings, T_InstalledTextModel } from '@/lib/homebrew'
import { useChatPage } from '@/components/features/chat/hook-chat-page'
import { ModelExplorerMenu } from '@/components/features/menus/home/tab-model-explorer'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ROUTE_CHATBOT } from '@/app/constants'
import { notifications } from '@/lib/notifications'

interface I_Props {
  onSubmit: () => void
  services: I_ServiceApis | null
  modelConfigs: I_ModelConfigs
  setModelConfigs: Dispatch<SetStateAction<I_ModelConfigs | undefined>>
  installedList: T_InstalledTextModel[]
  setInstalledList: Dispatch<SetStateAction<T_InstalledTextModel[]>>
  isConnecting: boolean
  setIsConnecting: Dispatch<SetStateAction<boolean>>
  setHasTextServiceConnected: Dispatch<SetStateAction<boolean>>
}

const Header = ({ children }: { children: React.ReactNode }) => <div className="my-8 flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>

const Title = ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>

const Description = ({ className, children }: { className?: string, children: React.ReactNode }) => <p className={cn("mb-4 text-sm text-muted-foreground", className)}>{children}</p>

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
  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting, services, modelConfigs, setModelConfigs, installedList, setInstalledList } = props
  const { notAvailable: notAvailableNotification } = notifications()
  const ROUTE_KNOWLEDGE = '/knowledge'
  const { loadModel: loadChatBot } = useChatPage({ services })
  // State
  const router = useRouter()
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>('')
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
    res?.success && res?.data && setBots(res.data)
  }, [services?.storage])

  const onSelect = useCallback(() => {
    onSubmit()
  }, [onSubmit])

  const createNewBotAction = () => {
    // show bot creation menu
    setOpenBotCreationMenu(true)
  }

  const fetchInstalledModelsAndConfigs = useCallback(async () => {
    // Get all currently installed models
    services?.textInference?.installed?.().then(listResponse =>
      listResponse?.data && setInstalledList(listResponse.data)
    )
    // Get all model configs
    services?.textInference?.getModelConfigs?.().then(cfgs =>
      cfgs?.data && setModelConfigs(cfgs.data)
    )
    return
  }, [services?.textInference, setInstalledList, setModelConfigs])

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
      const info = services?.textInference?.getModelInfo?.({ queryParams: payload })
      return info
    },
    [services?.textInference],
  )

  const downloadModel = useCallback(
    async ({ repo_id, filename }: { repo_id: string, filename: string }) => {
      await services?.textInference?.download?.({ body: { repo_id, filename } })
      return
    },
    [services?.textInference],
  )

  const deleteModel = useCallback(
    async (args: { repoId: string, filename: string }) => {
      // Remove the model weights file and installation details entry from json
      await services?.textInference?.delete?.({ body: args })
      return
    },
    [services?.textInference],
  )

  const onTabChange = useCallback(
    (val: string) => {
      // do stuff here when tab is selected ...
      switch (val) {
        case 'models':
          services && fetchInstalledModelsAndConfigs()
          break
        case 'playground':
          // fetch installed models?
          break
        case 'bots':
          services && fetchBots()
          break
        case 'assistants':
          // services && fetchAssistants()
          break
        case 'teams':
          // services && fetchTeams()
          break
        case 'knowledge':
          // services && fetchKBs()
          break
        default:
          // do nothing
          break
      }
    },
    [fetchBots, fetchInstalledModelsAndConfigs, services],
  )

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
        <Title><div className="my-2 text-center text-3xl font-bold">Custom Bots</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Personalized Ai with unique knowledge and expertise in a specific domain. Build your own with private data or use bots from our curated and community lists.
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
              onSelect()
              if (loadChatBot) {
                setIsConnecting(true)
                setHasTextServiceConnected(true)

                const action = async () => {
                  // Eject first
                  await services?.textInference?.unload()
                  // Load model
                  const res = await loadChatBot(botId)
                  return res
                }

                await notifications().loadModel(action())

                setIsConnecting(false)
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
        <Title><div className="my-2 text-center text-3xl font-bold">Empowered Assistants</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Augment your Bots with access to tools and the internet. When assigned tasks, they will create a deliverable in the specified format you provide.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={notAvailableNotification} />
        <Item title="Stock Analyst" Icon={QuestionMarkIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Entertainer" Icon={IconConversationType} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Software Developer" Icon={ClipboardIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Sci-Fi Author" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Lawyer" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Bio Researcher" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
      </div>
    </div>
  )

  const crewsMenu = (
    <div>
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Team of Assistants</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          {`A group of assistants working together under a "CEO" towards a stated goal. Submit criteria for a job to achieve by a specified deadline and get results back in the format you require.`}
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={notAvailableNotification} />
        <Item title="Publisher" Icon={QuestionMarkIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Game Studio" Icon={IconConversationType} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Advertising Company" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Quality Assurance" Icon={ClipboardIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Software Team" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Research Org" Icon={PersonIcon} onAction={notAvailableNotification} className={presetBotClass} />
      </div>
    </div>
  )

  const knowledgeMenu = (
    <div>
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Knowledge DataBase</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Upload text, images, video, audio when you require bots to memorize and understand specialized knowledge or private data. We provide you tools to easily access data from several sources.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={goToKnowledgePage} />
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
        <Title>
          <p className="my-2 text-center text-3xl font-bold">
            Ai Playground
          </p>
        </Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
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

  useEffect(() => {
    // Invoke the default tab's behavior
    onTabChange('models')
  }, [onTabChange])

  return (
    <div className="flex w-full flex-col overflow-hidden px-8 pb-4">
      <Tabs label="Application Modes" tabs={tabs} onChange={onTabChange} />
    </div>
  )
}
