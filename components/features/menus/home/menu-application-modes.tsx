'use client'

import { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonIcon, ClipboardIcon, Cross1Icon } from '@radix-ui/react-icons'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'
import { Playground } from '@/components/features/menus/home/tab-playground'
import { BotCreationMenu } from '@/components/features/menus/home/tab-bots'
import { ToolCreationMenu } from '@/components/features/menus/home/tab-tools'
import { I_Text_Settings, I_Tool_Definition } from '@/lib/homebrew'
import { ModelExplorerMenu } from '@/components/features/menus/home/tab-model-explorer'
import { DialogCreateCollection } from '@/components/features/crud/dialog-add-collection'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { ROUTE_CHATBOT, ROUTE_KNOWLEDGE } from '@/app/constants'
import { notifications } from '@/lib/notifications'
import { useGlobalContext } from '@/contexts'
import { useMemoryActions } from '@/components/features/crud/actions'
import { ClearData } from '@/components/features/crud/dialog-clear-data'
import { useActions } from './actions'

interface I_Props {
  onSubmit: () => void // exec some logic when list item is clicked
  isConnecting: boolean
  setIsConnecting: Dispatch<SetStateAction<boolean>>
  setHasTextServiceConnected: Dispatch<SetStateAction<boolean>>
}

const Header = ({ children }: { children: React.ReactNode }) => <div className="my-8 flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>

const Title = ({ children }: { children: React.ReactNode }) => <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>

const Description = ({ className, children }: { className?: string, children: React.ReactNode }) => <p className={cn('mb-4 text-sm text-muted-foreground', className)}>{children}</p>

const Item = ({ title, onAction, Icon, children, className }: { children?: ReactNode, title?: string, onAction?: () => void, Icon: any, className?: string }) => {
  return (
    <div className={`relative flex h-[12rem] w-[12rem] flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-accent p-4 ${className}`}>
      <div
        onClick={onAction}
        className={cn(
          buttonVariants({ size: 'sm', variant: 'outline' }),
          'outline-3 h-[50%] w-[50%] cursor-pointer rounded-full bg-background p-0 outline-offset-0 outline-muted-foreground hover:outline-dashed focus:outline-none',
        )}
      >
        <Icon className="h-[50%] w-[50%] text-foreground" />
      </div>
      <div className="text-md w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap text-center text-muted-foreground">{title}</div>
      {children}
    </div>
  )
}

export const ApplicationModesMenu = (props: I_Props) => {
  const { onSubmit, setHasTextServiceConnected, isConnecting, setIsConnecting } = props
  const { notAvailable: notAvailableNotification } = notifications()
  // State
  const { collections, setCollections, installedList, modelConfigs, services, tools } = useGlobalContext()
  const { fetchCollections, addCollection, deleteCollection } = useMemoryActions()
  const router = useRouter()
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>('')
  const [openBotCreationMenu, setOpenBotCreationMenu] = useState(false)
  const [openToolCreationMenu, setOpenToolCreationMenu] = useState<{ open: boolean, initialState?: I_Tool_Definition }>({ open: false })
  const [bots, setBots] = useState<I_Text_Settings[]>([])
  const [createCollectionDialogOpen, setCreateCollectionDialogOpen] = useState(false)
  const [hfModelsInfo, setHFModelsInfo] = useState<any[]>([])
  // Styling
  const deleteButtonStyle = 'absolute right-0 top-0 m-auto flex h-[2.5rem] w-[2.5rem] flex-row items-center justify-center gap-2 rounded-none rounded-bl-md bg-transparent p-2 text-sm outline outline-8 outline-neutral-200 hover:bg-red-500 dark:bg-transparent dark:outline-neutral-900 dark:hover:bg-red-500'
  const gridContentClass = 'grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] justify-items-center gap-6'
  const presetBotClass = 'opacity-40'
  // Methods
  const { fetchInstalledModelsAndConfigs, fetchTools } = useActions()
  const modelExploreAction = useCallback(async () => {
    await services?.textInference?.modelExplore()
    return
  }, [services?.textInference])

  const goToKnowledgePage = (name: string) => router.push(`/${ROUTE_KNOWLEDGE}/?collectionName=${name}`)

  const goToChatBotPage = (botId: string) => {
    onSubmit()
    const queryParams = `?id=${botId}`
    const pathname = `/${ROUTE_CHATBOT}${queryParams}`
    setHasTextServiceConnected(true)
    router.push(pathname)
  }

  const fetchBots = useCallback(async () => {
    // Save menu forms to a json file
    const res = await services?.storage.getBotSettings()
    // Update this menu's list of items
    res?.success && res?.data && setBots(res.data)
  }, [services?.storage])

  const updateKBCollections = useCallback(async () => {
    const data = await fetchCollections()
    data && setCollections(data)
  }, [fetchCollections, setCollections])

  const createNewBotAction = () => {
    // show bot creation menu
    setOpenBotCreationMenu(true)
  }

  const deleteBotConfig = useCallback(async (name: string) => {
    const action = async () => {
      const res = await services?.storage.deleteBotSettings({ queryParams: { name } })
      const data = res?.data
      if (!res?.success) {
        toast.error(`${res?.message}`)
        return false
      }
      // Update this menu's list of items
      data && setBots(data)
      // Success
      return true
    }
    return action()
  }, [services?.storage])

  const saveBotConfig = useCallback((settings: I_Text_Settings) => {
    const action = async () => {
      // Save menu forms to a json file
      const res = await services?.storage.saveBotSettings({ body: settings })
      if (!res?.success) {
        toast.error(`${res?.message}`)
        return false
      }
      // Update this menu's list of items
      res?.data && setBots(res.data)
      // Success
      toast.success(`${res?.message}`)
      return true
    }
    action()
  }, [services?.storage])

  const saveTool = useCallback(async (toolSettings: I_Tool_Definition) => {
    // Save menu forms to a json file
    const res = await services?.storage?.saveToolSettings?.({ body: toolSettings })
    // Failed
    if (!res?.success) {
      toast.error(`${res?.message}`)
      return
    }
    // Fetch list of tools
    await fetchTools()
    // Success
    toast.success(`${res?.message}`)
    return
  }, [fetchTools, services?.storage])

  const deleteTool = useCallback(async (id: string) => {
    const res = await services?.storage?.deleteToolSettings?.({ queryParams: { id } })
    // Failed
    if (!res?.success) return false
    // Success
    await fetchTools()
    return true
  }, [fetchTools, services?.storage])

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
      try {
        await services?.textInference?.download?.({ body: { repo_id, filename } })
        return
      } catch (err) {
        toast.error(`${err}`)
      }
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
          fetchInstalledModelsAndConfigs()
          break
        case 'playground':
          // fetch installed models?
          break
        case 'bots':
          services && fetchBots()
          break
        case 'tools':
          fetchTools()
          break
        case 'jobs':
          // services && fetchJobs()
          break
        case 'knowledge':
          // Fetch collections
          updateKBCollections()
          break
        default:
          // do nothing
          break
      }
    },
    [fetchBots, fetchInstalledModelsAndConfigs, fetchTools, services, updateKBCollections],
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
          Build unique Ai with knowledge and expertise in a specific domain. Create your own or choose from our curated list.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        {/* Create a bot */}
        <Item title="Add New" Icon={IconPlus} onAction={createNewBotAction} />
        {/* Presets and User generated bots */}
        {bots.map(bot => {
          const botId = bot.model?.botName
          if (!botId) return null
          const title = botId[0].toUpperCase() + botId.slice(1)
          return (
            <Item
              key={botId}
              title={title}
              Icon={() => <div className="text-4xl">🤖</div>}
              onAction={() => goToChatBotPage(botId)}
            >
              <ClearData
                className={deleteButtonStyle}
                variant="secondary"
                action={() => deleteBotConfig(botId)}
                Icon={Cross1Icon}
              />
            </Item>
          )
        }
        )}
        <Item title="Language Expert" Icon={() => <div className="text-4xl">💬</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Software Developer" Icon={() => <div className="text-4xl">💻</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Stock Analyst" Icon={() => <div className="text-4xl">📈</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Data Analyst" Icon={() => <div className="text-4xl">👨‍💻</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Historical Scholar" Icon={() => <div className="text-4xl">🎓</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Entertainer" Icon={() => <div className="text-4xl">🎤</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Sci-Fi Author" Icon={() => <div className="text-4xl">✍</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Lawyer" Icon={() => <div className="text-4xl">⚖</div>} onAction={createNewBotAction} className={presetBotClass} />
        <Item title="Bio Researcher" Icon={() => <div className="text-4xl">🦠</div>} onAction={createNewBotAction} className={presetBotClass} />
      </div>
    </div>
  )

  const toolsMenu = (
    <div>
      {/* Menu for tool creation */}
      <ToolCreationMenu
        dialogOpen={openToolCreationMenu}
        setDialogOpen={(isOpen) => setOpenToolCreationMenu({ open: isOpen })}
        onSubmit={saveTool}
      />

      {/* Title and description */}
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Tools for Ai Agents</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Augment your Bots with access to external tools. Build your own or choose from our open-source tools available in the cloud.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={() => setOpenToolCreationMenu({ open: true })} />
        {/* User generated tools */}
        {tools.map(tool => {
          const toolId = tool.id
          const toolName = tool.name
          if (!toolId) return null
          return (
            <Item
              key={toolId}
              title={toolName}
              Icon={() => <div className="text-4xl">🔧</div>}
              onAction={() => {
                // Open edit menu
                setOpenToolCreationMenu({ open: true, initialState: tool })
              }}
            >
              <ClearData
                className={deleteButtonStyle}
                variant="secondary"
                action={() => deleteTool(toolId)}
                Icon={Cross1Icon}
              />
            </Item>
          )
        })}
        {/* Presets */}
        {/* <Item
          title="Calculator"
          Icon={() => <div className="text-4xl">➗</div>}
          onAction={() => {
            const tool = {
              name: 'Calculator',
              path: 'calculator.py',
            }
            setOpenToolCreationMenu({ open: true, initialState: tool })
          }}
          className={presetBotClass}
        /> */}
        <Item title="Web Search" Icon={() => <div className="text-4xl">🌐</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="WIKI API" Icon={() => <div className="text-4xl">🔗</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Web Crawl" Icon={() => <div className="text-4xl">🕸</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="File Manager" Icon={() => <div className="text-4xl">🗃</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Shell Tools" Icon={() => <div className="text-4xl">🖥</div>} onAction={notAvailableNotification} className={presetBotClass} />
      </div>
    </div>
  )

  const jobsMenu = (
    <div>
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Ai Workloads</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Many Bots working together to complete a task. A real-world result is delivered in the format you specify.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <Item title="Add New" Icon={IconPlus} onAction={notAvailableNotification} />
        <Item title="Publish Paper" Icon={() => <div className="text-4xl">📰</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Design Game" Icon={() => <div className="text-4xl">🎮</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Write Ad Campaign" Icon={() => <div className="text-4xl">📢</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Q/A Product" Icon={() => <div className="text-4xl">🔎</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Build App" Icon={() => <div className="text-4xl">👨‍💻</div>} onAction={notAvailableNotification} className={presetBotClass} />
        <Item title="Research Topic" Icon={() => <div className="text-4xl">🔬</div>} onAction={notAvailableNotification} className={presetBotClass} />
      </div>
    </div>
  )

  const knowledgeMenu = (
    <div>
      <Header>
        <Title><div className="my-2 text-center text-3xl font-bold">Knowledge Base</div></Title>
        <Description className="mx-auto my-2 w-full max-w-[56rem] text-center text-lg">
          Enhance your Bots with long-term memory and private data. Upload text, images, video, audio into a collection and assign to any Bot.
        </Description>
      </Header>

      {/* Content */}
      <div className={gridContentClass}>
        <DialogCreateCollection
          action={addCollection}
          onSuccess={updateKBCollections}
          dialogOpen={createCollectionDialogOpen}
          setDialogOpen={setCreateCollectionDialogOpen}
        />
        {/* Add new item */}
        <Item title="Add New" Icon={IconPlus} onAction={() => setCreateCollectionDialogOpen(true)} />
        {/* Fetched, user created items */}
        {collections?.map(c => (
          <Item
            key={c?.id}
            title={c?.name}
            Icon={c?.metadata?.icon ? () => <div className="text-4xl">{c?.metadata?.icon}</div> : ClipboardIcon}
            onAction={() => goToKnowledgePage(c?.name)}
          >
            <ClearData
              className={deleteButtonStyle}
              variant="secondary"
              action={async () => {
                const res = await deleteCollection(c.name)
                if (res?.success) {
                  await updateKBCollections()
                  return true
                }
                return false
              }}
              Icon={Cross1Icon}
            />
          </Item>
        ))}
        {/* Preset items, @TODO Add values to their config menus */}
        <Item title="Documentation" Icon={ClipboardIcon} className={presetBotClass} onAction={() => setCreateCollectionDialogOpen(true)} />
        <Item title="Best Practices" Icon={() => <div className="text-4xl">🚯</div>} className={presetBotClass} onAction={() => setCreateCollectionDialogOpen(true)} />
        <Item title="Code Repo" Icon={() => <div className="text-4xl">📂</div>} className={presetBotClass} onAction={() => setCreateCollectionDialogOpen(true)} />
        <Item title="Contacts" Icon={PersonIcon} className={presetBotClass} onAction={() => setCreateCollectionDialogOpen(true)} />
        <Item title="Notes" Icon={() => <div className="text-4xl">📝</div>} className={presetBotClass} onAction={() => setCreateCollectionDialogOpen(true)} />
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
          Try out any installed Ai model in a temporary chat session. Experiment with settings and prompting techniques in a private and safe environment.
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
      label: 'models',
      icon: '👨‍💻',
      content: (
        <ModelExplorerMenu
          data={modelConfigs}
          installedModelsInfo={installedList}
          Header={Header}
          Title={Title}
          Description={Description}
          onOpenDirAction={modelExploreAction}
          fetchModelInfo={fetchModelInfo}
          downloadModel={downloadModel}
          deleteModel={deleteModel}
          hfModelsInfo={hfModelsInfo}
          setHFModelsInfo={setHFModelsInfo}
        />
      )
    },
    { label: 'playground', icon: '🌎', content: playgroundMenu },
    { label: 'bots', icon: '🤖', content: botsMenu },
    { label: 'tools', icon: '🛠', content: toolsMenu },
    { label: 'jobs', icon: '🧰', content: jobsMenu },
    {
      label: 'knowledge',
      icon: '📚',
      content: knowledgeMenu
    },
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
