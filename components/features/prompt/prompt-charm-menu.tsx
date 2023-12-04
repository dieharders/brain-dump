'use client'

import { useCallback, useEffect, useState } from 'react'
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
  icon: (props: any) => JSX.Element
  toolTipText?: string
  onPromptCallback?: (inputPrompt: string) => string
  // llmProps?: { [key: string]: string }
}

export type T_CharmId = 'memory' | 'microphone' | 'chat' | 'template' | 'accuracy'

interface I_CharmItemProps {
  children: React.ReactNode
  action?: () => void
  actionText?: string
}

export interface I_Props {
  open: boolean
  activeCharms: I_Charm[]
  setActiveCharms: (charm: I_Charm) => void
}

export const CharmMenu = (props: I_Props) => {
  const { open, activeCharms, setActiveCharms } = props
  const MAX_HEIGHT = 'h-[8rem]'
  const MIN_HEIGHT = 'h-0'
  const sizeHeight = open ? MAX_HEIGHT : MIN_HEIGHT
  const classnameIcon = 'h-16 w-16 cursor-pointer'
  const DEFAULT_EXPLANATION = 'Use Charms to enhance the conversation'
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION)
  const [openQueryCharmDialog, setOpenQueryCharmDialog] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const { getServices } = useHomebrew()
  const { fetchCollections } = useMemoryActions(services)
  const activeCharmVisibility = open ? 'opacity-0' : 'opacity-100'

  const onQueryCharmSubmit = useCallback(
    (selectedCharm: I_Charm) => {
      if (selectedCharm) setActiveCharms(selectedCharm)
    }, [setActiveCharms])

  const CharmItem = (props: I_CharmItemProps) => {
    return (
      <Badge className="h-8 w-8 p-1" onClick={props?.action} onMouseEnter={() => setExplanation(props?.actionText || '')} onMouseLeave={() => setExplanation(DEFAULT_EXPLANATION)}>
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
      <QueryCharmMenu dialogOpen={openQueryCharmDialog} setDialogOpen={setOpenQueryCharmDialog} fetchListAction={fetchCollections} onSubmit={onQueryCharmSubmit} />
      {/* Active Charms Icons */}
      <div className={`relative w-full overflow-visible transition-opacity duration-300 ease-out ${activeCharmVisibility}`}>
        <span className="absolute -top-4 left-0 flex w-full flex-row items-center justify-center space-x-8">
          {activeCharms.map(charm => {
            const Component = charm.icon
            return (
              <Tooltip key={charm.id} delayDuration={250}>
                <TooltipTrigger
                  tabIndex={-1}
                  className="focus:bg-muted focus:ring-1 focus:ring-ring"
                >
                  <CharmItem>
                    <Component className={classnameIcon}>{charm.id}</Component>
                  </CharmItem>
                  <span className="sr-only">Currently selected memories: {charm?.toolTipText}</span>
                </TooltipTrigger>
                <TooltipContent sideOffset={12}>Memories: <span className="select-none text-left text-indigo-400">{charm?.toolTipText}</span></TooltipContent>
              </Tooltip>
            )
          })}
        </span>
      </div>
      {/* Charms Menu */}
      <div className={`transition-[height] duration-300 ease-in-out ${sizeHeight} overflow-hidden`}>
        {/* Selectable Charms Buttons */}
        <div className="flex h-fit w-full flex-row flex-nowrap items-center justify-center space-x-6 overflow-x-auto overflow-y-hidden py-4">
          {/* Microphone - use to input text */}
          <CharmItem actionText="Microphone - Transform speech to text">
            <IconMicrophone className={classnameIcon} />
          </CharmItem>

          {/* Target Brain - which memory collection to use as context */}
          <CharmItem actionText="Query memory - Select a collection of memories to use as context">
            <IconBrain className={classnameIcon} onClick={() => setOpenQueryCharmDialog(true)} />
          </CharmItem>

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
        <p className="h-fit w-full p-2 text-center text-sm text-neutral-500">{explanation}</p>
      </div>
    </>
  )
}
