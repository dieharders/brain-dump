'use client'

import { useEffect, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { useHomebrew } from '@/lib/homebrew'
import { useSettings } from '@/components/features/settings/hooks'
import { ModelID } from '@/components/features/settings/types'
import { AIModels } from '@/components/features/settings/hooks'
import { toast } from 'react-hot-toast'

interface IProps {
  id?: string
  initialMessages?: Message[]
}

export const ChatContainer = ({ id, initialMessages }: IProps) => {
  const { provider: selectedProvider, model: selectedModel } = useSettings()
  const [modelId, setModelId] = useState<AIModels | undefined>(undefined)
  const [connectOnce, setConnectOnce] = useState(false)
  const { connect: connectToLocalProvider, apis } = useHomebrew()

  // Get model from somewhere (extension, localStorage, etc)
  useEffect(() => {
    const connect = async () => {
      // @TODO Do we really need to select a provider when the engine decides what model is loaded?
      // Attempt to verify the local provider exists.
      if (selectedProvider === ModelID.Local) {
        const res = await connectToLocalProvider()
        if (res?.success) {
          toast.success(`Connected to local provider 🎉`)
          setModelId(selectedProvider as AIModels)
        }
      }
    }

    if (!connectOnce) {
      if (selectedProvider === 'no provider selected') return
      connect()
      setConnectOnce(true)
    }
  }, [selectedProvider, connectOnce, connectToLocalProvider])

  if (
    selectedProvider === 'no provider selected' ||
    selectedModel === 'no model selected' ||
    !modelId ||
    !selectedModel
  )
    return <div className="text-center">No provider/model selected</div>
  if (selectedProvider === ModelID.Local && modelId)
    return <LocalChat id={id} initialMessages={initialMessages} modelId={modelId} apis={apis} />
}
