'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel, defaultDomain, defaultPort, useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApplicationModesMenu } from '@/components/features/menus/app-entry/menu-application-modes'
import { toast } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'

/**
 * This holds the main app behavior
 */
export const AppEntry = () => {
  const { theme } = useTheme()
  // Wrapper for styling the app background
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [services, setServices] = useState<I_ServiceApis | null>(null)
  const [hasTextServiceConnected, setHasTextServiceConnected] = useState(false)
  const { provider: selectedProvider } = useSettings()
  const { connect: connectToHomebrew, getServices, saveRemoteAddress } = useHomebrew()
  const [installedList, setInstalledList] = useState<T_InstalledTextModel[]>([])
  const [modelConfigs, setModelConfigs] = useState<I_ModelConfigs>()
  const [hasMounted, setHasMounted] = useState(false)
  // For inputs
  const [domainValue, setDomainValue] = useState(defaultDomain)
  const [portValue, setPortValue] = useState(defaultPort)

  const connect = useCallback(async () => {
    setIsConnecting(true)

    // Record values to homebrew lib for later api calls
    saveRemoteAddress({ domainValue, portValue })

    // Attempt to verify the local provider and text inference service exists.
    if (selectedProvider === ModelID.Local) {
      const res = await connectToHomebrew()

      // Record the attempt
      setIsConnecting(false)

      if (res?.success) {
        toast.success(`Connected to local provider`)
        setIsConnected(true)
        // Get all currently installed models
        const listResponse = await services?.textInference.installed()
        listResponse?.data && setInstalledList(listResponse.data)
        // Get all model configs
        const cfgs = await services?.textInference.getModelConfigs()
        cfgs?.data && setModelConfigs(cfgs.data)
        // Success
        return true
      }
      toast.error(`Failed to connect to local provider.`)
      return false
    }

    setIsConnecting(false)
    return false
  }, [connectToHomebrew, domainValue, portValue, saveRemoteAddress, selectedProvider, services?.textInference])

  const ChooseBackendPage = () => {
    const containerStyle = 'flex w-[24rem] flex-row items-center justify-between gap-3 rounded-lg bg-background/20 p-4 overflow-hidden'
    const inputStyle = 'w-fit border-none bg-muted text-center text-primary outline-none hover:bg-primary/20 transition-all ease-out duration-100'
    const labelStyle = 'text-left text-sm font-semibold text-primary/50'

    return (
      <div className={cn(wrapperStyle, "items center flex h-full w-full flex-col justify-center")}>
        <div className="flex h-[32rem] w-[32rem] flex-col items-center justify-start gap-4 rounded-xl border-2 border-accent bg-muted/60 p-8">
          {/* Title */}
          <div className="justify-self-start text-center text-lg font-semibold text-primary">Connect to remote server</div>

          {/* Enter remote server address */}
          <div className={containerStyle}>
            <Label htmlFor="domain" className={labelStyle}>Hostname</Label>
            <Input
              name="domain"
              value={domainValue}
              placeholder={`domain (${domainValue})`}
              onChange={e => setDomainValue(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Enter remote server port */}
          <div className={containerStyle}>
            <Label htmlFor="port" className={labelStyle}>Port</Label>
            <Input
              name="port"
              value={portValue}
              placeholder={`port (${defaultPort})`}
              onChange={e => setPortValue(e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Connect */}
          <Button
            className="m-auto h-fit w-fit justify-self-end bg-blue-600 px-16 text-center text-primary hover:bg-blue-800"
            onClick={connect}
            disabled={isConnecting}
          >
            Connect to HomeBrewAi
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    saveRemoteAddress({ domainValue, portValue })
  }, [domainValue, portValue, saveRemoteAddress])

  useEffect(() => {
    // Always unload current model
    services?.textInference.unload()
  }, [services?.textInference])

  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
    // Get all possible server endpoints
    const action = async () => {
      const res = await getServices()
      if (res) setServices(res)
    }
    action()
  }, [getServices, hasMounted, theme])

  // Render

  // Prevent server/client render mismatch
  if (!hasMounted) return null
  // HomeBrewAi connection menu
  if (!isConnected) return ChooseBackendPage()
  // Inference connection menu
  if (!hasTextServiceConnected)
    return (
      <div className={wrapperStyle}>
        {/* Model Selection Menu */}
        <ApplicationModesMenu
          setHasTextServiceConnected={setHasTextServiceConnected}
          isConnecting={isConnecting}
          setIsConnecting={setIsConnecting}
          modelConfigs={modelConfigs || {}}
          installedList={installedList}
          onSubmit={() => { /* exec logic when a route is navigated */ }}
          services={services}
        />
      </div>
    )
  // Connected - Render "no selection" warning
  // @TODO Put an indeterminant loading spinner here since we dont know what could be loading
  return (
    // Matrix bg ?
    <div className={wrapperStyle}>
      <div className="m-4 text-center">Loading LLM Model...
      </div>
    </div>
  )
}
