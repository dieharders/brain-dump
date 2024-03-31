'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { I_ModelConfigs, I_ServiceApis, T_InstalledTextModel, defaultDomain, defaultPort, useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconSpinner } from '@/components/ui/icons'
import Link from 'next/link'
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
  const docsUrl = `${domainValue}:${portValue}/docs`

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
        // Success
        toast.success(`Connected to inference provider`)
        return true
      }
      toast.error(`Failed to connect to inference provider.`)
      return false
    }

    setIsConnecting(false)
    return false
  }, [connectToHomebrew, domainValue, portValue, saveRemoteAddress, selectedProvider])

  const ChooseBackendPage = () => {
    const containerStyle = cn('flex w-full flex-col items-center justify-between gap-3 overflow-hidden rounded-lg border border-neutral-600 bg-neutral-200 p-4 dark:bg-muted/50 sm:flex-row')
    const inputStyle = cn('bg-muted-background flex-1 border-none text-center text-primary outline-none transition-all duration-100 ease-out hover:bg-muted-foreground hover:font-bold hover:text-accent focus:font-bold focus-visible:outline-neutral-500 focus-visible:ring-0 dark:bg-primary/20 dark:hover:bg-primary dark:hover:font-bold dark:hover:text-accent sm:w-fit')
    const labelStyle = cn('min-w-[6rem] text-center text-sm font-semibold text-muted-foreground sm:text-left')

    return (
      <div className={cn(wrapperStyle, "mt-8 flex h-full w-full flex-col items-center justify-start overflow-hidden bg-background px-8")}>
        {/* Header */}
        <h1 className="p-8 text-center text-4xl font-bold">Welcome to<br />
          <div className="py-2 text-5xl leading-snug">🍺OpenBrew Studio</div>
        </h1>

        <div className="mb-16 flex min-h-[28rem] w-full max-w-[32rem] flex-col items-center justify-between gap-4 overflow-hidden rounded-xl border border-neutral-500 p-8 dark:border-neutral-600">
          {/* Title */}
          <h2 className="mb-4 justify-self-start text-center text-3xl font-semibold text-primary">
            Connect to Ai server
          </h2>

          <div className="mb-auto flex w-full flex-col items-center gap-4">
            {/* Enter remote server address */}
            <div className={containerStyle}>
              <Label htmlFor="domain" className={labelStyle}>Hostname</Label>
              <Input
                name="domain"
                value={domainValue}
                placeholder={defaultDomain}
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
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            {/* Instructions */}
            <div>
              Please be sure to startup <u>OpenBrew Server</u> on a local or remote machine before attempting to connect.
              You can download it <Link href="https://openbrewai.com" target="_blank"><Button variant="link" className="m-0 p-0">here</Button></Link>.
            </div>
            {/* API Docs link */}
            <Link href={docsUrl} className="w-full">
              <div className="inline">API docs:</div>
              <Button variant="link" className="m-0 p-0 pl-1">
                {docsUrl}
              </Button>
            </Link>
          </div>

          {/* Connect */}
          <Button
            className="light:text-primary h-fit w-full justify-center justify-self-end bg-blue-600 px-16 text-center hover:bg-blue-800 dark:text-primary"
            onClick={async () => {
              const success = await connect()
              let res

              if (success) {
                if (!services) {
                  // Get all possible server endpoints after successfull connection
                  res = await getServices()
                  if (res) setServices(res)
                }
              }

              if (success && res) {
                setIsConnected(true)
                return
              }
              toast.error(`Failed to connect to inference provider. Could not fetch services.`)
              return
            }}
            disabled={isConnecting}
          >
            Connect
          </Button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Always unload current model
    services?.textInference.unload()
  }, [services?.textInference])

  // Get all possible server endpoints
  useEffect(() => {
    const action = async () => {
      const res = await getServices()
      if (res) setServices(res)
    }
    // Need to make sure this executes again even after failing until it succeeds
    if (!hasMounted && !services) action()
  }, [getServices, hasMounted, services])

  // Make sure this is client side, otherwise theme is used incorrect
  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  // Render

  // @TODO Implement SPA routing instead of rendering component pages here
  // Prevent server/client render mismatch
  if (!hasMounted) return null
  // HomeBrewAi connection menu
  if (!isConnected) return ChooseBackendPage()
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
    // Matrix bg ?
    <div className={cn(wrapperStyle, 'flex flex-col items-center justify-center gap-4')}>
      <div className="m-4 text-center text-lg font-bold">Loading LLM Model...</div>
      <IconSpinner className="h-16 w-16 animate-spin" />
    </div>
  )
}
