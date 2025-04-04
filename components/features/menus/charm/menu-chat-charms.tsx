'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  IconGPU,
  IconCPU,
  IconMicrophone,
  IconGear,
  IconSynth,
  IconBrain,
  IconResearch,
} from '@/components/ui/icons'
import { EyeOpenIcon, ImageIcon } from '@radix-ui/react-icons'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { I_State as I_ModelSettings, PromptTemplateCharmMenu } from '@/components/features/menus/charm/menu-charm-model'
import { I_ServiceApis, useHomebrew } from '@/lib/homebrew'
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

export type T_CharmId = 'microphone' | 'speak' | 'memory' | 'model' | 'prompt' | 'gpu-override' | 'deep-research' | 'image-gen' | 'vision-lang'

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
  const [selectedTools, setSelectedTools] = useState(playgroundSettings.tools?.assigned || [])
  const [openPromptCharmDialog, setOpenPromptCharmDialog] = useState(false)
  const isActive = useCallback((id: string) => activeCharms.find(n => n === id), [activeCharms])
  const shouldRender = useCallback((id: string) => charmsList.find(n => n === id), [charmsList])
  const { fetchTools } = useActions()
  const overflowShow = 'overflow-x-auto overflow-y-hidden'
  const overflowHide = 'overflow-hidden'
  const overflow = open ? overflowShow : overflowHide

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
  } = useModelSettingsMenu({ services })

  const CharmItem = (props: I_CharmItemProps) => {
    return (
      <Badge
        className={`h-12 w-12 cursor-pointer bg-accent p-2 ring-[inherit] ring-background hover:bg-background ${props.className}`}
        onClick={props?.onClick}
        onMouseEnter={() => setExplanation(props?.actionText || '')}
        onMouseLeave={() => setExplanation(DEFAULT_EXPLANATION)}
      >
        {props.children}
      </Badge>
    )
  }

  // Override gpu-layers setting
  const saveGPUOverrideSetting = (override: boolean) => {
    const val = override ? -1 : 0
    setPlaygroundSettings(prev => {
      const newPerf = { ...prev.performance, n_gpu_layers: val }
      return { ...prev, performance: newPerf }
    })
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
        // This was set from a sep page and thus has not controls on this one
        // toolUseMode={playgroundSettings.attention.tool_use_mode || DEFAULT_TOOL_USE_MODE}
        />
      }

      {/* Charms Selection Menu */}
      <div className={`transition-[height, opacity] flex flex-col justify-between overflow-hidden ease-out ${sizeHeight} ${activeCharmVisibility} ${animDuration}`}>
        {/* Selectable Charms Buttons */}
        <div className={`scrollbar flex h-full w-full snap-proximity flex-row flex-nowrap items-center gap-8 sm:justify-center sm:px-0 ${overflow} justify-around px-4 py-2`}>
          {/* Vision Language */}
          {shouldRender('vision-lang') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('vision-lang') && activeStyle),
              actionText: 'Vision - Give the Ai an image to look at and use as context.',
              onClick: () => toggleActiveCharm('vision-lang'),
              children: <EyeOpenIcon className={cn(iconStyle, 'rounded-none')} />,
            })
          }
          {/* Image Generation */}
          {shouldRender('image-gen') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('image-gen') && activeStyle),
              actionText: 'Image Gen - Create an image based on the prompt.',
              onClick: () => toggleActiveCharm('image-gen'),
              children: <ImageIcon className={cn(iconStyle, 'rounded-none')} />,
            })
          }
          {/* Deep Research */}
          {shouldRender('deep-research') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('deep-research') && activeStyle),
              actionText: 'Research - Enable the use of a research pattern when outputting response.',
              onClick: () => toggleActiveCharm('deep-research'),
              children: <IconResearch className={cn(iconStyle, 'rounded-none')} />,
            })
          }
          {/* Memory */}
          {shouldRender('memory') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('memory') && activeStyle),
              actionText: 'Memory - Assign stores of data/memories for the Ai to source context from.',
              onClick: () => toggleActiveCharm('memory'),
              children: <IconBrain className={iconStyle} />,
            })
          }
          {/* GPU - use to override gpu layers setting */}
          {shouldRender('gpu-override') &&
            CharmItem({
              className: cn(emptyRingStyle, isActive('gpu-override') && activeStyle),
              actionText: 'Force GPU/CPU - (On) Use GPU for faster inference. (Off) Use CPU only.',
              onClick: () => {
                toggleActiveCharm('gpu-override')
                const val = !!isActive('gpu-override')
                saveGPUOverrideSetting(!val)
              },
              children: isActive('gpu-override') ? <IconGPU className={cn(iconStyle, 'rounded-none')} /> : <IconCPU className={cn(iconStyle, 'rounded-none')} />,
            })
          }
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

        <DropdownMenuSeparator className="w-full self-center" />

        {/* Explanation of charm item when hovered */}
        <p className="flex h-[4rem] w-full select-none flex-col items-center justify-center overflow-hidden break-words px-2 py-0 text-center text-sm text-neutral-500">{explanation}</p>
      </div>
    </>
  )
}
