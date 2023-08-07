'use client'

import { useEffect, useState } from 'react'
import { type Message } from 'ai/react'
import { LocalChat } from '@/components/local-chat'
import { CloudChat } from '@/components/cloud-chat'
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

  // Get model from somewhere (extension, localStorage, etc)
  useEffect(() => {
    // This specifically works only with `local.ai` provider.
    const getModel = async (): Promise<{ id: string }> => {
      const ip = 'http://localhost:8000/model'
      // We send an example prompt to get the model id
      const options = {
        stream: true,
        prompt: 'Who created you?',
        messages: [{ role: 'user', content: 'Who created you?' }],
        temperature: 1.0,
      }

      try {
        const response = await fetch(ip, {
          method: 'POST',
          mode: 'cors', // no-cors, *cors, same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          redirect: 'follow',
          referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify(options),
        })

        return await response.json()
      } catch (error) {
        console.log('@@ error:', error)
        toast.error('Local provider connection failed. ' + `${error}`)
        return { id: '' }
      }
    }

    const connect = async () => {
      // Attempt to verify the local provider exists.
      if (selectedProvider === ModelID.Local) {
        const inference = await getModel() // returns name of the inference provider's server
        if (inference.id === 'local.ai') {
          // console.log('@@ Connected to:', inference, 'server!')
          toast.success(`Connected to ${inference.id}`)
          setModelId(selectedProvider as AIModels)
        }
      } else {
        // Otherwise we are using cloud providers
        toast.success(`Connected to cloud provider: ${selectedProvider}/${selectedModel}`)
        setModelId(`${selectedProvider}/${selectedModel}` as AIModels)
      }
    }

    if (!connectOnce) {
      if (selectedProvider === 'no provider selected') return
      connect()
      setConnectOnce(true)
    }
  }, [selectedModel, selectedProvider, connectOnce])

  if (
    selectedProvider === 'no provider selected' ||
    selectedModel === 'no model selected' ||
    !modelId ||
    !selectedModel
  )
    return <div className="text-center">No provider/model selected</div>
  if (selectedProvider === ModelID.Local && modelId)
    return <LocalChat id={id} initialMessages={initialMessages} modelId={modelId} />
  else if (selectedModel)
    return <CloudChat id={id} initialMessages={initialMessages} modelId={selectedModel} />
}
