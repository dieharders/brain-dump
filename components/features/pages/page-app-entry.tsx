'use client'

import { useEffect, useMemo, useState } from 'react'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel, useHomebrew } from '@/lib/homebrew'
import { IconSpinner } from '@/components/ui/icons'
import { ApplicationModesMenu } from '@/components/features/menus/app-entry/menu-application-modes'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { cn, constructMainBgStyle } from '@/lib/utils'
import appSettings from '@/lib/localStorage'

/**
 * This holds the main app behavior
 */
export const AppEntry = () => {
  const { theme } = useTheme()
  const router = useRouter()
  // Wrapper for styling the app background
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [hasTextServiceConnected, setHasTextServiceConnected] = useState(false)
  const { getServices } = useHomebrew()
  const [installedList, setInstalledList] = useState<T_InstalledTextModel[]>([])
  const [modelConfigs, setModelConfigs] = useState<I_ModelConfigs>()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // Always unload current model
    services?.textInference.unload()
  }, [services?.textInference])

  // Make sure this is client side, otherwise theme is used incorrect
  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  useEffect(() => {
    const setting = appSettings.getHostConnectionFlag()
    setIsConnected(setting)
    const action = async () => {
      const res = await getServices()
      if (res) setServices(res)
    }
    if (setting) action()
  }, [getServices])

  // Render

  // Prevent server/client render mismatch
  if (!hasMounted) return null
  // Go to server connection menu
  if (!isConnected) return router.replace('connect')
  // Inference connection menu
  if (!hasTextServiceConnected)
    return (
      <div className={wrapperStyle}>
        {/* Main Menu */}
        <ApplicationModesMenu
          setHasTextServiceConnected={setHasTextServiceConnected}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          modelConfigs={modelConfigs || {}}
          setModelConfigs={setModelConfigs}
          installedList={installedList}
          setInstalledList={setInstalledList}
          onSubmit={() => { /* exec logic when a route is navigated */ }}
          services={services}
        />
      </div>
    )
  // Connected - Render "no selection" warning
  // @TODO Put an indeterminant loading spinner here since we dont know what could be loading
  return (
    <div className={cn(wrapperStyle, 'flex flex-col items-center justify-center gap-4')}>
      <div className="m-4 text-center text-lg font-bold">Loading LLM Model...</div>
      <IconSpinner className="h-16 w-16 animate-spin" />
    </div>
  )
}
