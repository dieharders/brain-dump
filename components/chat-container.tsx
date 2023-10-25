'use client'

import { useCallback, useEffect, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

declare global {
  interface Window { hasChatMounted: boolean }
}

interface IProps {
  id?: string
  initialMessages?: Message[]
}

export const ChatContainer = ({ id, initialMessages }: IProps) => {
  const { provider: selectedProvider, model: selectedModel } = useSettings()
  const [isConnecting, setIsConnecting] = useState(false)
  const [hasHBConnected, setHasHBConnected] = useState(false)
  const [hasTextServiceConnected, setHasTextServiceConnected] = useState(false)
  const { connect: connectToHomebrew, connectTextService, apis } = useHomebrew()

  const connect = useCallback(async () => {
    // Attempt to verify the local provider and text inference service exists.
    if (selectedProvider === ModelID.Local) {
      const res = await connectToHomebrew()

      if (res?.success) {
        toast.success(`Connected to local provider...waiting for Ai connection...`)
        return true
      }
      toast.error(`Failed to connect to local provider.`)
      return false
    }
    return false
  }, [connectToHomebrew, selectedProvider])

  const connectTextServiceAction = useCallback(async () => {
    const action = async () => {
      try {
        const data = await connectTextService()
        const id = data?.[0]?.id

        if (data) {
          setHasTextServiceConnected(true)
          toast.success(`Connected to Ai model [${id}]`)
          return true
        }
        return false
      } catch (error) {
        toast.error(`An unexpected error occured connecting to Ai: ${error}`)
        return false
      }
    }

    setIsConnecting(true)
    const result = await action()
    setIsConnecting(false)
    return result
  }, [connectTextService])

  // Attempt initial connection to homebrew api
  useEffect(() => {
    if (selectedProvider === 'no provider selected' || !selectedProvider) return
    if (!hasHBConnected && !isConnecting && !window.hasChatMounted) {
      // @TODO Why does this execute multiple times? B/c we need global state.
      // @TODO Maybe move the connection code to a component that only mounts once.
      const dispatchAction = async () => {
        setIsConnecting(true)
        const success = await connect()
        if (success) setHasHBConnected(true)
        setIsConnecting(false)
      }

      dispatchAction()
      window.hasChatMounted = true
    }
  }, [hasHBConnected, connect, isConnecting, selectedProvider])

  // Connect to text inference
  useEffect(() => {
    // Attempt to connect to text inference service
    if (apis && !isConnecting) {
      console.log('@@ connn to text service')
      connectTextServiceAction()
    }
  }, [apis, connectTextServiceAction, isConnecting])

  const isLocalSelected = selectedProvider === ModelID.Local
  const isCloudSelected = selectedProvider !== ModelID.Local && selectedModel !== 'no model selected'

  // Render connection UI
  if (!isConnecting) {
    // Render "Waiting..." feedback
    if (!hasHBConnected)
      return <div className="m-4 text-center">Waiting for server...</div>
    // Render Connect button
    if (!hasTextServiceConnected)
      return (
        <>
          <div className="m-4 text-center">Connected to HomebrewAi server. Waiting for Ai engine to start.</div>
          <Button
            className="text-white-50 m-4 w-fit bg-blue-600 px-16 text-center hover:bg-white hover:text-blue-700"
            onClick={connectTextServiceAction}
            disabled={isConnecting}
          >
            Connect to Ai
          </Button>
        </>
      )
  }
  // Render "Connecting..." feedback
  if (isConnecting && !hasHBConnected)
    return <div className="m-4 text-center">Connecting to server...</div>
  // Connected
  if (!isConnecting && hasHBConnected) {
    // Render chat UI (Local)
    if (isLocalSelected)
      return <LocalChat id={id} initialMessages={initialMessages} apis={apis} />
    // Render chat UI (cloud)
    if (isCloudSelected)
      // return <CloudChat id={id} initialMessages={initialMessages} apis={apis} />
      return <div className="m-4 text-center">Connect to Cloud provider...</div>
    // Render "no selection" warning
    return <div className="m-4 text-center">No model selected. Go to settings {'->'} LLM Model and choose one.</div>
  }

}
