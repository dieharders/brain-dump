'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  IconBrain,
  IconMicrophone,
  IconGear,
  IconSynth,
} from '@/components/ui/icons'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { KnowledgeCharmMenu } from '@/components/features/menus/charm/menu-charm-knowledge'
import { I_State as I_ModelSettings, PromptTemplateCharmMenu } from '@/components/features/menus/charm/menu-charm-model'
import { useMemoryActions } from '@/components/features/crud/actions'
import { DEFAULT_ACTIVE_ROLE, I_Knowledge_State, I_ServiceApis, T_ActiveRoles, useHomebrew } from '@/lib/homebrew'
import { useModelSettingsMenu } from '@/components/features/menus/charm/hook-charm-model'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { useGlobalContext } from '@/contexts'
import { useActions } from '@/components/features/menus/home/actions'

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
  charmsList: T_CharmId[] // What charms to render
  activeCharms: T_CharmId[]
  toggleActiveCharm: (id: T_CharmId) => void
}

export const CharmMenu = (props: I_Props) => {
  const { open, charmsList, activeCharms, toggleActiveCharm } = props
  const { playgroundSettings, setPlaygroundSettings } = useGlobalContext()
  const MAX_HEIGHT = 'h-[8rem]'
  const MIN_HEIGHT = 'h-0'
  const sizeHeight = open ? MAX_HEIGHT : MIN_HEIGHT
  const iconStyle = 'h-fit w-16 cursor-pointer rounded-full text-primary bg-ghost'
  const activeCharmVisibility = !open ? 'opacity-0' : 'opacity-100'
  const DEFAULT_EXPLANATION = 'Use Charms to enhance the conversation'
  const activeStyle = 'shadow-[0_0_0.5rem_0.35rem_rgba(99,102,241,0.9)] ring-2 ring-purple-300'
  const emptyRingStyle = 'ring-2 ring-accent'
  const animDuration = open ? 'duration-150' : 'duration-500'
  const { getServices } = useHomebrew()
  const [hasMounted, setHasMounted] = useState(false)
  const [services, setServices] = useState<I_ServiceApis>({} as I_ServiceApis)
  const [explanation, setExplanation] = useState(DEFAULT_EXPLANATION)
  const [activeRole, setActiveRole] = useState<T_ActiveRoles>(playgroundSettings.attention.active_role || DEFAULT_ACTIVE_ROLE)
  const [selectedTools, setSelectedTools] = useState(playgroundSettings.tools?.assigned || [])
  const [openQueryCharmDialog, setOpenQueryCharmDialog] = useState(false)
  const [openPromptCharmDialog, setOpenPromptCharmDialog] = useState(false)
  const isActive = useCallback((id: string) => activeCharms.find(n => n === id), [activeCharms])
  const shouldRender = useCallback((id: string) => charmsList.find(n => n === id), [charmsList])
  const { fetchCollections } = useMemoryActions()
  const { fetchTools } = useActions()

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

  const saveModelSettings = useCallback((args: I_ModelSettings) => {
    const action = async () => {
      if (args) {
        // Save state
        setPlaygroundSettings(prev => ({ ...prev, ...args }))
      }
      return
    }
    return action()
  }, [setPlaygroundSettings])

  const saveKnowledgeSettings = useCallback((settings: { knowledge: I_Knowledge_State }) => {
    const action = async () => {
      // Save menu forms
      setPlaygroundSettings(prev => ({ ...prev, knowledge: settings.knowledge }))
      // Save state
      playgroundSettings.attention?.active_role && setActiveRole(playgroundSettings.attention.active_role)
      return
    }
    return action()
  }, [playgroundSettings.attention.active_role, setPlaygroundSettings])

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
      {shouldRender('memory') &&
        <KnowledgeCharmMenu
          dialogOpen={openQueryCharmDialog}
          setDialogOpen={setOpenQueryCharmDialog}
          fetchListAction={fetchCollections}
          onSubmit={async (knowledgeSettings) => {
            await saveKnowledgeSettings(knowledgeSettings)
            toast.success('Knowledge settings saved!')
          }}
        />
      }

      {/* Menu for Prompt Template settings */}
      {shouldRender('prompt') &&
        <PromptTemplateCharmMenu
          fetchToolsAction={fetchTools}
          selectedTools={selectedTools}
          setSelectedTools={setSelectedTools}
          dialogOpen={openPromptCharmDialog}
          setDialogOpen={setOpenPromptCharmDialog}
          onSubmit={async (settings) => {
            await saveModelSettings(settings)
            toast.success('Model settings saved!')
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
          activeRole={activeRole}
        />
      }

      {/* Charms Selection Menu */}
      <div className={`transition-[height, opacity] justify-between space-y-2 ease-out ${sizeHeight} overflow-hidden ${activeCharmVisibility} ${animDuration}`}>
        {/* Selectable Charms Buttons */}
        <div className="scrollbar flex h-16 w-full flex-row flex-nowrap items-center justify-center space-x-6 overflow-x-auto overflow-y-hidden">
          {/* Microphone - use to input text */}
          {shouldRender('microphone') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('microphone') && activeStyle),
              actionText: 'Microphone - Transform speech to text',
              onClick: () => toggleActiveCharm('microphone'),
              children: <IconMicrophone className={iconStyle} />,
            })
          }

          {/* Audio Response */}
          {shouldRender('speak') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('speak') && activeStyle),
              children: <IconSynth className={iconStyle} />,
              actionText: 'Speak - Have the Ai speak back to you',
              onClick: () => toggleActiveCharm('speak'),
            })
          }

          {/* Query Memory - target a memory collection to use as context */}
          {shouldRender('memory') &&
            CharmItem({
              className: emptyRingStyle,
              children: <IconBrain className={iconStyle} />,
              actionText: 'Query Memory - Select a memory to use as context',
              onClick: () => setOpenQueryCharmDialog(true),
            })
          }

          {/* Model Settings */}
          {shouldRender('prompt') &&
            CharmItem({
              className: emptyRingStyle,
              children: <IconGear className={iconStyle} />,
              actionText: 'Model Settings - Modify your Ai behavior',
              onClick: async () => {
                await fetchData()
                setOpenPromptCharmDialog(true)
              }
            })
          }

        </div>

        <DropdownMenuSeparator />

        {/* Explanation of charm item when hovered */}
        <p className="flex h-fit w-full select-none flex-col justify-center break-words px-2 text-center text-sm text-neutral-500">{explanation}</p>
      </div>
    </>
  )
}
