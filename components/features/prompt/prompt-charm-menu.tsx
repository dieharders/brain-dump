'use client'

import { useEffect, useRef, useState } from 'react'
import {
  IconUser,
  IconBrain,
  IconMicrophone,
  IconPromptTemplate,
  IconConversationType,
} from '@/components/ui/icons'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { QueryCharmMenu } from '@/components/features/prompt/dialog-query-charm'
import { useMemoryActions } from '@/components/features/crud/actions'
import { I_ServiceApis, useHomebrew } from '@/lib/homebrew'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface I_Charm {
  id: T_CharmId
  toolTipText?: string
  onPromptCallback?: (inputPrompt: string) => string
  // llmProps?: { [key: string]: string }
}

export type T_CharmId = 'memory' | 'microphone' | 'chat' | 'template' | 'accuracy'

interface I_CharmItemProps {
  children: React.ReactNode
  onClick?: () => void
  actionText?: string
}

export interface I_Props {
  open: boolean
  activeCharms: I_Charm[]
  addActiveCharm: (charm: I_Charm) => void
  removeActiveCharm: (id: T_CharmId) => void
}

export const CharmMenu = (props: I_Props) => {
  const { open, activeCharms, addActiveCharm, removeActiveCharm } = props
  const MAX_HEIGHT = 'h-[8rem]'
  const MIN_HEIGHT = 'h-0'
  const sizeHeight = open ? MAX_HEIGHT : MIN_HEIGHT
  const classnameIcon = 'h-fit w-16 cursor-pointer rounded-full text-white bg-ghost'
  const DEFAULT_EXPLANATION = 'Use Charms to enhance the conversation'
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION)
  const [openQueryCharmDialog, setOpenQueryCharmDialog] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const { fetchCollections } = useMemoryActions(services)
  const activeCharmVisibility = !open ? 'opacity-0' : 'opacity-100'
  const animDuration = open ? 'duration-150' : 'duration-500'
  const memoryCharm = activeCharms.find(i => i.id === 'memory')
  const memoryCharmFocused = memoryCharm ? 'shadow-[0_0_0.5rem_0.35rem_rgba(99,102,241,0.9)] ring-4 ring-purple-300' : ''
  const selectedMemoriesList = useRef<string[]>([])

  const CharmItem = (props: I_CharmItemProps) => {
    return (
      <Badge
        className="h-10 w-10 cursor-pointer bg-black p-2 ring-2 ring-accent hover:bg-accent"
        onClick={props?.onClick}
        onMouseEnter={() => setExplanation(props?.actionText || '')}
        onMouseLeave={() => setExplanation(DEFAULT_EXPLANATION)}
      >
        {props.children}
      </Badge>
    )
  }

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
      {/* Items' Menus */}
      <QueryCharmMenu
        dialogOpen={openQueryCharmDialog}
        setDialogOpen={setOpenQueryCharmDialog}
        fetchListAction={fetchCollections}
        onSubmit={addActiveCharm}
        removeCharm={removeActiveCharm}
        selected={selectedMemoriesList}
      />

      {/* Charms Selection Menu */}
      <div className={`transition-[height, opacity] justify-between space-y-2 ease-out ${sizeHeight} overflow-hidden ${activeCharmVisibility} ${animDuration}`}>
        {/* Selectable Charms Buttons */}
        <div className="scrollbar flex h-16 w-full flex-row flex-nowrap items-center justify-center space-x-6 overflow-x-auto overflow-y-hidden">
          {/* Microphone - use to input text */}
          <CharmItem actionText="Microphone - Transform speech to text">
            <IconMicrophone className={classnameIcon} />
          </CharmItem>

          {/* Query Memory - target a memory collection to use as context */}
          <Tooltip delayDuration={250}>
            <TooltipTrigger
              tabIndex={-1}
              className={`h-10 rounded-full ${memoryCharmFocused}`}
            >
              <CharmItem actionText="Query memory - Select a collection of memories to use as context" onClick={() => setOpenQueryCharmDialog(true)} >
                <IconBrain className={classnameIcon} />
              </CharmItem>
              <TooltipContent
                sideOffset={10}
              >
                {/* List of currently selected memories */}
                Memories: <span className="max-w-64 flex select-none flex-col flex-wrap items-center justify-center overflow-x-hidden break-words text-indigo-400">
                  {memoryCharm?.toolTipText?.split(' ')?.map((i, index) => <p key={index}>{i}</p>)}
                </span>
              </TooltipContent>
              <span className="sr-only">Currently selected memories: {memoryCharm?.toolTipText}</span>
            </TooltipTrigger>
          </Tooltip>

          {/* Conversation Type - Q+A, Conversational, Inquisitive, Assistant, Agent? */}
          <CharmItem actionText="Conversation Type - Q&A, Conversational, Inquisitive, Assistant, Agent">
            <IconConversationType className={classnameIcon} />
          </CharmItem>

          {/* Prompt Template - You are an expert researcher/coder/generalist/etc. Includes presets as well as a custom form to write your own */}
          <CharmItem actionText="Prompt Template - Tweak presets or write your own">
            <IconPromptTemplate className={classnameIcon} />
          </CharmItem>

          {/* Agent Presets - creative, precise, normal */}
          <CharmItem actionText="Response Accuracy - creative, precise, normal">
            <IconUser className={classnameIcon} />
          </CharmItem>
        </div>

        <DropdownMenuSeparator />

        {/* Explanation of charm item when hovered */}
        <p className="flex h-fit w-full flex-col justify-center break-words px-2 text-center text-sm text-neutral-500">{explanation}</p>
      </div>
    </>
  )
}
