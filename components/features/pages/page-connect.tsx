'use client'

import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import { Custom } from '@/lib/auth/providers/custom'
import { useRouter } from 'next/navigation'
import { defaultDomain, defaultPort, useHomebrew } from '@/lib/homebrew'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Highlight, InfoLink } from '@/components/ui/info'
import appStorage from '@/lib/localStorage'
import { useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/contexts'
import { MatrixWaterfall } from '@/components/features/backgrounds/matrix-waterfall'

const containerStyle = cn('bg-neutral-transparent relative w-full items-center justify-between rounded-lg border border-neutral-600 p-4')
const inputStyle = cn('hover:text-muted-background dark:hover:text-muted-background w-full border-none bg-neutral-200 text-center text-primary outline-none transition-all duration-100 ease-out hover:bg-neutral-300 hover:font-bold focus:font-bold focus-visible:outline-neutral-500 focus-visible:ring-0 dark:bg-primary/20 dark:hover:bg-neutral-600 dark:hover:font-bold')
const labelStyle = cn('absolute -top-2 left-[50%] w-fit -translate-x-1/2 rounded-sm bg-background p-0 text-center text-xs font-bold text-muted-foreground sm:left-4 sm:translate-x-0')

const Bg = () => {
  return (
    <div className="absolute left-0 top-0 h-full w-full" style={{ 'backgroundSize': '100% auto' }}>
      <MatrixWaterfall fontSize={20} padding={25} className="h-screen" />
      {/* Blur */}
      <div className="left-0 top-0 h-full w-full backdrop-blur-sm"></div>
    </div>
  )
}

{/* Enter name, etc of User */ }
const Login = ({ nameRef }: { nameRef: MutableRefObject<HTMLInputElement> }) => {
  const [nameValue, setNameValue] = useState('')

  return (
    <div className={cn(containerStyle, 'mt-2')}>
      <Input
        ref={nameRef}
        name="username"
        value={nameValue}
        placeholder="anonymous"
        onChange={e => setNameValue(e.target.value)}
        className={inputStyle}
      />
      <Label htmlFor="username" className={labelStyle}><div className="px-4">Name</div></Label>
    </div>
  )
}

const Menu = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setServices } = useGlobalContext()
  const { connect: connectToHomebrew, getServices } = useHomebrew()
  const [isConnecting, setIsConnecting] = useState(false)
  // For inputs
  const hostParam = searchParams.get('hostname')
  const portParam = searchParams.get('port')
  const [domainValue, setDomainValue] = useState('')
  const [portValue, setPortValue] = useState('')
  const docsUrl = `${domainValue}:${portValue}/docs`
  // State
  const [isAdvChecked, setIsAdvChecked] = useState(false)
  const nameRef = useRef<any>()

  const connect = useCallback(async () => {
    // Record connection options
    appStorage.setHostConnection({ domain: domainValue, port: portValue })
    // Success
    const res = await connectToHomebrew()
    return res
  }, [connectToHomebrew, domainValue, portValue])

  const connectAction = async (creds: { username: string }) => {
    setIsConnecting(true)

    // Auth user
    const user = await Custom().authorize(creds)
    if (!user) throw new Error('Could not login user.')

    // Connect to api server
    const res = await connect()

    if (res?.success) {
      // Get all possible server endpoints after successfull connection
      const res = await getServices()
      if (res) {
        // Record services list
        setServices(res)
        // Record the user details in sessionStorage
        appStorage.setUserDetails(user)
        // Record successful connection
        router.push('home')
        setIsConnecting(false)
        return
      }
    }

    // Fail
    setIsConnecting(false)
    throw new Error(`Could not fetch services. ${res?.message}`)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const conn = appStorage.getHostConnection()
      setDomainValue(hostParam || conn.domain || defaultDomain)
      setPortValue(portParam || conn.port || defaultPort)
    }
  }, [hostParam, portParam])

  return (
    <div className="flex w-full max-w-[32rem] flex-col items-center justify-between gap-6 rounded-xl border-neutral-500 bg-background p-2 dark:border-neutral-600 sm:border sm:p-8">
      {/* Advanced Options Button */}
      <div className="flex w-full flex-row gap-4 text-sm text-muted-foreground">
        {/* Switch to advanced UI */}
        <div className="flex cursor-default flex-row items-center gap-2 text-lg">
          <label title="Advanced Settings">⚙️</label>
          <Switch
            defaultChecked={false}
            checked={isAdvChecked}
            onCheckedChange={setIsAdvChecked}
          ></Switch>
        </div>
        {/* Issues */}
        <InfoLink label="Click to resolve issues" title="Issues connecting?" className="inline-block">
          <span>
            If you cannot connect to <Highlight>Obrew Server</Highlight> verify you have entered the address shown on the host computer correctly and click {' '}
            <Link href={docsUrl} target="_blank" prefetch={false}>
              <Button variant="link" className="m-0 h-fit p-0">
                here
              </Button></Link>
            . If your browser reports it blocked, click the &quot;advanced&quot; option in your browser and choose &quot;accept&quot; then try connecting again.
          </span>
        </InfoLink>
      </div>
      {/* Server Inputs */}
      {isAdvChecked && (
        <div className="flex w-full flex-col items-center gap-8 pt-2">
          {/* Enter remote server address */}
          <div className={containerStyle}>
            <Input
              name="domain"
              value={domainValue}
              placeholder={defaultDomain}
              onChange={e => setDomainValue(e.target.value)}
              className={inputStyle}
            />
            <Label htmlFor="domain" className={labelStyle}><div className="px-4">Server</div></Label>
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
            <Label htmlFor="port" className={labelStyle}><div className="px-4">Port</div></Label>
          </div>
        </div>
      )}
      {/* Login */}
      <Login nameRef={nameRef} />
      {/* Connect */}
      <Button
        className="h-fit w-full justify-center justify-self-end border border-[#343a40] bg-[#ffd43b] px-16 text-center text-lg text-[#343a40] shadow-none hover:bg-[#fab005]"
        onClick={() => toast.promise(connectAction({ username: nameRef.current?.value }), {
          loading: 'Connecting to Ai server.',
          success: 'Success! Loading app...',
          error: (err) => `Failed to connect to Ai server.\n${err}`,
        })}
        disabled={isConnecting}
      >
        Start Building
      </Button>
    </div>
  )
}

export const ConnectPage = () => {
  const appVer = process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION
  const displayAppVersion = appVer && <p className="z-100 absolute left-[1rem] top-[1.5rem] text-sm font-bold text-yellow-300/40 hover:text-yellow-300/80">UI v{appVer}</p>
  return (
    <div className="flex flex-row items-stretch justify-items-stretch self-stretch justify-self-stretch">
      <Bg />
      <div className="light:bg-primary absolute left-0 top-0 flex h-full w-full flex-col items-center justify-around justify-items-stretch overflow-x-hidden p-12 dark:bg-sky-400/10">
        {/* Inputs */}
        <Menu />
        {/* Display app version */}
        {displayAppVersion}
      </div>
    </div>
  )
}
