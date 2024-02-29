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
import { I_State as I_ModelSettings, PromptTemplateCharmMenu } from '@/components/features/prompt/dialog-prompt-charm'
import { useMemoryActions } from '@/components/features/crud/actions'
import { I_Knowledge_State, I_ServiceApis, useHomebrew } from '@/lib/homebrew'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useModelSettingsMenu } from '@/components/features/menus/charm/hook-charm-model'
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
  setState?: Dispatch<SetStateAction<I_ModelSettings>>
}

// @TODO Break out the charm menu from LocalChat since we want to pass specific charms to the chat per page
export const CharmMenu = (props: I_Props) => {
  const { open, activeCharms, addActiveCharm, removeActiveCharm, setState } = props
  const { getServices } = useHomebrew()
  const MAX_HEIGHT = 'h-[8rem]'
  const MIN_HEIGHT = 'h-0'
  const sizeHeight = open ? MAX_HEIGHT : MIN_HEIGHT
  const iconStyle = 'h-fit w-16 cursor-pointer rounded-full text-primary bg-ghost'
  const DEFAULT_EXPLANATION = 'Use Charms to enhance the conversation'
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION)
  const [openQueryCharmDialog, setOpenQueryCharmDialog] = useState(false)
  const [openPromptCharmDialog, setOpenPromptCharmDialog] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [services, setServices] = useState<I_ServiceApis>({} as I_ServiceApis)
  const activeCharmVisibility = !open ? 'opacity-0' : 'opacity-100'
  const animDuration = open ? 'duration-150' : 'duration-500'
  const memoryCharm = activeCharms.find(i => i.id === 'memory')
  const promptCharm = activeCharms.find(i => i.id === 'prompt')
  const activeStyle = 'shadow-[0_0_0.5rem_0.35rem_rgba(99,102,241,0.9)] ring-2 ring-purple-300'
  const emptyRingStyle = 'ring-2 ring-accent'
  const selectedMemoriesList = useRef<string[]>([])
  const selectedMemoriesText = selectedMemoriesList.current?.map((i, index) => <p key={index}>{i}</p>)
  const [knowledgeType, setKnowledgeType] = useState<string>('')

  const {
    fetchData,
    stateResponse,
    setStateResponse,
    stateSystem,
    setStateSystem,
    statePrompt,
    setStatePrompt,
    promptTemplates,
    systemPrompts,
    ragTemplates,
    ragModes,
  } = useModelSettingsMenu({ services })

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

  const { fetchCollections } = useMemoryActions(services)

  const saveModelSettings = useCallback((args: I_ModelSettings) => {
    // Save to settings file
    const action = async () => {
      if (args) {
        const res = await services?.storage.savePlaygroundSettings({ body: args })
        res?.success && toast.success('Model settings saved!')
        // Save state
        setState && setState(args)
      }
    }
    action()
  }, [services?.storage, setState])

  const saveKnowledgeSettings = useCallback((settings: I_Knowledge_State) => {
    const action = async () => {
      // Save menu forms to a json file
      const res = await services?.storage.savePlaygroundSettings({ body: settings })
      res?.success && toast.success('Knowledge settings saved!')
    }
    action()
  }, [services?.storage])

  // Get services
  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      if (res) {
        setServices(res)
        setHasMounted(true)
      }
    }
    if (!hasMounted) action()
  }, [getServices, hasMounted])

  return (
    <>
      {/* Collections list for Knowledge Base menu */}
      <KnowledgeCharmMenu
        dialogOpen={openQueryCharmDialog}
        setDialogOpen={setOpenQueryCharmDialog}
        fetchListAction={fetchCollections}
        onSubmit={knowledgeSettings => {
          // addActiveCharm(charm)
          setKnowledgeType(knowledgeSettings.type)
          saveKnowledgeSettings(knowledgeSettings)
        }}
      />
      {/* Menu for Prompt Template settings */}
      <PromptTemplateCharmMenu
        dialogOpen={openPromptCharmDialog}
        setDialogOpen={setOpenPromptCharmDialog}
        onSubmit={settings => {
          // addActiveCharm(charm)
          saveModelSettings(settings)
          toast.success('Prompt settings saved!')
        }}
        stateResponse={stateResponse}
        setStateResponse={setStateResponse}
        stateSystem={stateSystem}
        setStateSystem={setStateSystem}
        statePrompt={statePrompt}
        setStatePrompt={setStatePrompt}
        promptTemplates={promptTemplates}
        systemPrompts={systemPrompts}
        ragTemplates={ragTemplates}
        ragModes={ragModes}
        knowledgeType={knowledgeType}
        services={services}
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

          {/* Model Settings */}
          <CharmItem
            className={`${emptyRingStyle} ${promptCharm && activeStyle}`}
            actionText="Model Settings - Modify your Ai behavior"
            onClick={async () => {
              await fetchData()
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
