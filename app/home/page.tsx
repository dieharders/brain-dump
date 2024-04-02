'use client'

import { useEffect, useMemo, useState } from 'react'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel, useHomebrew } from '@/lib/homebrew'
import { ApplicationModesMenu } from '@/components/features/menus/app-entry/menu-application-modes'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'
import appSettings from '@/lib/localStorage'

const HomeMenuPage = () => {
  const { theme } = useTheme()
  // Wrapper for styling the app background
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
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
    const action = async () => {
      const res = await getServices()
      if (res) setServices(res)
    }
    if (setting) action()
  }, [getServices])

  // Render

  // Prevent server/client render mismatch
  if (!hasMounted) return null
  // Render empty (indeterminant loading) page
  if (isConnecting || hasTextServiceConnected)
    return (
      <div className={cn(wrapperStyle, 'flex flex-col items-center justify-center')}></div>
    )
  // Main Menu
  return (
    <div className={wrapperStyle}>
      <ApplicationModesMenu
        setHasTextServiceConnected={setHasTextServiceConnected}
        isConnecting={isConnecting}
        setIsConnecting={setIsConnecting}
        modelConfigs={modelConfigs || {}}
        setModelConfigs={setModelConfigs}
        installedList={installedList}
        setInstalledList={setInstalledList}
        onSubmit={() => { /* exec logic when a list item is clicked */ }}
        services={services}
      />
    </div>
  )
}

export default HomeMenuPage
