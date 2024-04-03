'use client'

import { useCallback, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { cn, constructMainBgStyle } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { ModelID } from '@/components/features/settings/types'
import { defaultDomain, defaultPort, useHomebrew } from '@/lib/homebrew'
import { useTheme } from 'next-themes'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/components/features/settings/hooks'
import appSettings from '@/lib/localStorage'

export const ConnectServerPage = () => {
  const { provider: selectedProvider } = useSettings()
  const router = useRouter()
  const { theme } = useTheme()
  const { connect: connectToHomebrew, getServices } = useHomebrew()
  const containerStyle = cn('bg-neutral-transparent relative w-full items-center justify-between rounded-lg border border-neutral-600 p-4')
  const inputStyle = cn('bg-muted-background w-full border-none bg-neutral-200 text-center text-primary outline-none transition-all duration-100 ease-out hover:bg-muted-foreground hover:font-bold hover:text-accent focus:font-bold focus-visible:outline-neutral-500 focus-visible:ring-0 dark:bg-primary/20 dark:hover:bg-primary dark:hover:font-bold dark:hover:text-accent')
  const labelStyle = cn('absolute -top-2 left-[50%] z-50 min-w-[5rem] -translate-x-1/2 rounded-sm bg-background p-0 text-center text-xs font-bold text-muted-foreground sm:left-4 sm:translate-x-0')
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const [isConnecting, setIsConnecting] = useState(false)
  // For inputs
  const [domainValue, setDomainValue] = useState(defaultDomain)
  const [portValue, setPortValue] = useState(defaultPort)
  const docsUrl = `${domainValue}:${portValue}/docs`

  const connect = useCallback(async () => {
    setIsConnecting(true)

    // Attempt to verify the local provider and text inference service exists.
    if (selectedProvider === ModelID.Local) {
      // Record connection options
      appSettings.setHostConnection({ domain: domainValue, port: portValue })

      const res = await connectToHomebrew()

      // Record the attempt
      setIsConnecting(false)

      // Success
      if (res?.success) return true

      // Fail
      return false
    }

    setIsConnecting(false)
    return false
  }, [connectToHomebrew, domainValue, portValue, selectedProvider])

  const connectAction = async () => {
    const success = await connect()

    if (success) {
      // Get all possible server endpoints after successfull connection
      const res = await getServices()
      if (res) {
        // Record successful connection
        appSettings.setHostConnectionFlag(true)
        router.push('home')
        return
      }
    }

    toast.error(`Failed to connect to inference provider. Could not fetch services.`)
    return
  }

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

        <div className="mb-auto flex w-full flex-col items-center gap-8">
          {/* Enter remote server address */}
          <div className={containerStyle}>
            <Input
              name="domain"
              value={domainValue}
              placeholder={defaultDomain}
              onChange={e => setDomainValue(e.target.value)}
              className={inputStyle}
            />
            <Label htmlFor="domain" className={labelStyle}>Hostname</Label>
          </div>
          {/* Enter remote server port */}
          <div className={containerStyle}>
            <Input
              name="port"
              value={portValue}
              placeholder={`port (${defaultPort})`}
              onChange={e => setPortValue(e.target.value)}
              className={inputStyle}
            />
            <Label htmlFor="port" className={labelStyle}>Port</Label>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-8 text-sm text-muted-foreground">
          {/* Instructions */}
          <div>
            Please be sure to startup <u>OpenBrew Server</u> on a local or remote machine before attempting to connect.
            You can download it <Link href="https://openbrewai.com" target="_blank" prefetch={false}><Button variant="link" className="m-0 h-fit p-0">here</Button></Link>.
          </div>
          {/* API Docs link */}
          <div className="justify-left flex w-full flex-col items-center gap-2 sm:flex-row">
            <div className="w-full min-w-[4rem] flex-1 text-left">API docs:</div>
            <div className="w-full">
              <Link href={docsUrl} prefetch={false} className="justify-start">
                <Button variant="link" className="h-fit p-0 text-left">
                  {docsUrl}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Connect */}
        <Button
          className="light:text-primary h-fit w-full justify-center justify-self-end bg-blue-600 px-16 text-center hover:bg-blue-800 dark:text-primary"
          onClick={() => toast.promise(connectAction(), {
            loading: 'Connecting to Ai server.',
            success: 'Success! Loading app...',
            error: 'Failed to connect to Ai server.',
          })}
          disabled={isConnecting}
        >
          Connect
        </Button>
      </div>
    </div>
  )
}
