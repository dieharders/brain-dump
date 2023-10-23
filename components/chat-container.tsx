'use client'

import { useCallback, useEffect, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { AIModels } from '@/components/features/settings/hooks'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface IProps {
  id?: string
  initialMessages?: Message[]
}

export const ChatContainer = ({ id, initialMessages }: IProps) => {
  const { provider: selectedProvider, model: selectedModel } = useSettings()
  const [modelId, setModelId] = useState<AIModels | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectOnce, setConnectOnce] = useState(false)
  const { connect: connectToHomebrew, connectTextService, apis } = useHomebrew()

  const connect = useCallback(async () => {
    // @TODO Do we really need to select a provider when the engine decides what model is loaded?
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
          setModelId(selectedProvider as AIModels)
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
  }, [connectTextService, selectedProvider])

  // Do initial connection to homebrew api
  useEffect(() => {
    if (!connectOnce) {
      if (selectedProvider === 'no provider selected') return
      const dispatchAction = async () => {
        const success = await connect()
        if (success) setConnectOnce(true)
      }
      dispatchAction()
    }
  }, [selectedProvider, connectOnce, connect])

  // Connect to text inference
  useEffect(() => {
    // Attempt to connect to text inference service
    if (apis) connectTextServiceAction()
  }, [apis, connectTextServiceAction])

  const isLocalSelected = selectedProvider === 'local'
  const isCloudSelected = selectedModel !== 'no model selected' && !!modelId

  // Render
  if (!isLocalSelected && !isCloudSelected)
    return (<>
      {!isConnecting && connectOnce && <Button
        className="text-white-50 m-4 w-fit bg-blue-600 px-16 text-center hover:bg-white hover:text-blue-700"
        onClick={connectTextServiceAction}
        disabled={isConnecting}
      >
        Connect
      </Button>}
      <div className="text-center">No provider/model selected</div>
    </>)
  if (selectedProvider === ModelID.Local && modelId)
    return <LocalChat id={id} initialMessages={initialMessages} modelId={modelId} apis={apis} />
}
