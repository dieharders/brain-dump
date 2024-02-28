'use client'

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import {
  IconBrain,
  IconMicrophone,
  IconPromptTemplate,
  IconSynth,
} from '@/components/ui/icons'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { KnowledgeCharmMenu } from '@/components/features/menus/charm/menu-charm-knowledge'
import { PromptTemplateCharmMenu } from '@/components/features/prompt/dialog-prompt-charm'
import { useMemoryActions } from '@/components/features/crud/actions'
import { I_Knowledge_State, I_ServiceApis, I_Text_Settings, T_PromptTemplates, T_SystemPrompts, useHomebrew } from '@/lib/homebrew'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'react-hot-toast'

export interface I_Charm {
  id: T_CharmId
  toolTipText?: string
  onCallback?: () => any
}

export type T_CharmId = 'microphone' | 'speak' | 'memory' | 'model' | 'prompt'

interface I_CharmItemProps {
  children: React.ReactNode
  onClick?: () => void
  actionText?: string
  className?: string
}

export interface I_Props {
  open: boolean
  activeCharms: I_Charm[]
  addActiveCharm: (charm: I_Charm) => void
  removeActiveCharm: (id: T_CharmId) => void
  settings?: I_Text_Settings
  setSettings?: Dispatch<SetStateAction<I_Text_Settings>>
}

// @TODO Break out the charm menu from LocalChat since we want to pass specific charms to the chat per page
export const CharmMenu = (props: I_Props) => {
  const { open, activeCharms, settings, addActiveCharm, removeActiveCharm, setSettings } = props
  const MAX_HEIGHT = 'h-[8rem]'
  const MIN_HEIGHT = 'h-0'
  const sizeHeight = open ? MAX_HEIGHT : MIN_HEIGHT
  const iconStyle = 'h-fit w-16 cursor-pointer rounded-full text-primary bg-ghost'
  const DEFAULT_EXPLANATION = 'Use Charms to enhance the conversation'
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION)
  const [openQueryCharmDialog, setOpenQueryCharmDialog] = useState(false)
  const [openPromptCharmDialog, setOpenPromptCharmDialog] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices, getAPIConfigOptions } = useHomebrew()
  const APIConfigOptions = useRef({})
  const activeCharmVisibility = !open ? 'opacity-0' : 'opacity-100'
  const animDuration = open ? 'duration-150' : 'duration-500'
  const memoryCharm = activeCharms.find(i => i.id === 'memory')
  const promptCharm = activeCharms.find(i => i.id === 'prompt')
  const [promptTemplates, setPromptTemplates] = useState<T_PromptTemplates | undefined>()
  const [systemPrompts, setSystemPrompts] = useState<T_SystemPrompts | undefined>()
  const activeStyle = 'shadow-[0_0_0.5rem_0.35rem_rgba(99,102,241,0.9)] ring-2 ring-purple-300'
  const emptyRingStyle = 'ring-2 ring-accent'
  const selectedMemoriesList = useRef<string[]>([])
  const selectedMemoriesText = selectedMemoriesList.current?.map((i, index) => <p key={index}>{i}</p>)

  const CharmItem = (props: I_CharmItemProps) => {
    return (
      <Badge
        className={`h-10 w-10 cursor-pointer bg-accent p-2 ring-[inherit] ring-background hover:bg-background ${props.className}`}
        onClick={props?.onClick}
        onMouseEnter={() => setExplanation(props?.actionText || '')}
        onMouseLeave={() => setExplanation(DEFAULT_EXPLANATION)}
      >
        {props.children}
      </Badge>
    )
  }

  const fetchPromptTemplates = useCallback(async () => services?.textInference.getPromptTemplates(), [services?.textInference])
  const fetchRagPromptTemplates = useCallback(async () => services?.textInference.getRagPromptTemplates(), [services?.textInference])
  const fetchSystemPrompts = useCallback(async () => services?.textInference.getSystemPrompts(), [services?.textInference])
  const { fetchCollections } = useMemoryActions(services)

  type T_SavePromptSettings = (args: I_Text_Settings) => void

  const saveSettings = useCallback<T_SavePromptSettings>((args) => {
    // Save to settings file
    args && services?.storage.savePlaygroundSettings({ body: args })
    // Save state
    setSettings && setSettings(args)
  }, [services?.storage, setSettings])

  const saveKnowledgeSettings = useCallback((settings: I_Knowledge_State) => {
    toast.success('Knowledge settings saved!')
    const action = async () => {
      // Save menu forms to a json file
      await services?.storage.savePlaygroundSettings({ body: settings })
    }
    action()
  }, [services?.storage])

  // Get services
  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      const cfg = await getAPIConfigOptions()

      if (res) {
        setServices(res)
        setHasMounted(true)
      }
      if (cfg) APIConfigOptions.current = cfg
    }
    if (!hasMounted) action()
  }, [getAPIConfigOptions, getServices, hasMounted])

  return (
    <>
      {/* Collections list for Knowledge Base menu */}
      <KnowledgeCharmMenu
        dialogOpen={openQueryCharmDialog}
        setDialogOpen={setOpenQueryCharmDialog}
        fetchListAction={fetchCollections}
        onSubmit={knowledgeSettings => {
          saveKnowledgeSettings(knowledgeSettings)
        }}
      />
      {/* Menu for Prompt Template settings */}
      <PromptTemplateCharmMenu
        dialogOpen={openPromptCharmDialog}
        setDialogOpen={setOpenPromptCharmDialog}
        onSubmit={(charm, templateSettings) => {
          addActiveCharm(charm)
          saveSettings(templateSettings)
          toast.success('Prompt settings saved!')
        }}
        settings={settings || {}}
        promptTemplates={promptTemplates}
        systemPrompts={systemPrompts}
        options={APIConfigOptions.current}
      />

      {/* Charms Selection Menu */}
      <div className={`transition-[height, opacity] justify-between space-y-2 ease-out ${sizeHeight} overflow-hidden ${activeCharmVisibility} ${animDuration}`}>
        {/* Selectable Charms Buttons */}
        <div className="scrollbar flex h-16 w-full flex-row flex-nowrap items-center justify-center space-x-6 overflow-x-auto overflow-y-hidden">
          {/* Microphone - use to input text */}
          <CharmItem
            className={`${emptyRingStyle}`}
            actionText="Microphone - Transform speech to text"
          >
            <IconMicrophone className={iconStyle} />
          </CharmItem>

          {/* Audio Response */}
          <CharmItem
            className={`${emptyRingStyle}`}
            actionText="Speak - Have the Ai speak back to you"
          >
            <IconSynth className={iconStyle} />
          </CharmItem>

          {/* Query Memory - target a memory collection to use as context */}
          <Tooltip delayDuration={250}>
            <TooltipTrigger
              tabIndex={-1}
              className={`h-10 rounded-full ${emptyRingStyle} ${memoryCharm && activeStyle}`}
            >
              <CharmItem actionText="Query Memory - Select a memory to use as context" onClick={() => setOpenQueryCharmDialog(true)} >
                <IconBrain className={iconStyle} />
              </CharmItem>
              <TooltipContent
                sideOffset={10}
              >
                {/* List of currently selected memories */}
                Memories: <span className="max-w-64 flex select-none flex-col flex-wrap items-center justify-center overflow-x-hidden break-words text-indigo-400">
                  {selectedMemoriesText}
                </span>
              </TooltipContent>
              <span className="sr-only">Currently selected memories: {memoryCharm?.toolTipText}</span>
            </TooltipTrigger>
          </Tooltip>

          {/* Prompt Type - Includes presets, advanced settings as well as a custom form to write your own */}
          <CharmItem
            className={`${emptyRingStyle} ${promptCharm && activeStyle}`}
            actionText="Prompt Template - Use presets or write your own"
            onClick={async () => {
              const normal = await fetchPromptTemplates()
              const rag = await fetchRagPromptTemplates()
              normal && rag && setPromptTemplates({ rag_presets: rag.data, normal_presets: normal.data })
              await fetchSystemPrompts().then(res => res?.data && setSystemPrompts(res.data))
              setOpenPromptCharmDialog(true)
            }}>
            <IconPromptTemplate className={iconStyle} />
          </CharmItem>
        </div>

        <DropdownMenuSeparator />

        {/* Explanation of charm item when hovered */}
        <p className="flex h-fit w-full select-none flex-col justify-center break-words px-2 text-center text-sm text-neutral-500">{explanation}</p>
      </div>
    </>
  )
}
