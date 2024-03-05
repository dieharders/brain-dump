'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useHomebrew } from '@/lib/homebrew'
import { ROUTE_CHATBOT, ROUTE_PLAYGROUND } from '@/app/constants'

export const ModelReadout = () => {
  const { getServices } = useHomebrew()
  const [title, setTitle] = useState('???')
  // @TODO Get these values from somewhere
  const gpu = '0'
  const cpu = '0'
  const pathname = usePathname()
  const routeId = pathname.split('/')[1] // base url
  const shouldRender = routeId === ROUTE_CHATBOT || routeId === ROUTE_PLAYGROUND

  useEffect(() => {
    const action = async () => {
      const services = await getServices()
      const currentModel = await services?.textInference.model()
      const currentModelId = currentModel?.data?.modelId || ''
      const configs = await services?.textInference.getModelConfigs()
      const model = configs?.data?.[currentModelId]
      const name = model?.name
      name && setTitle(name)
    }
    if (shouldRender) action()
  }, [getServices, shouldRender])

  return (
    shouldRender
      ?
      <div className="w-fill flex flex-1 items-center justify-center gap-4 overflow-hidden whitespace-nowrap rounded-md border-2 border-primary/10 bg-muted p-2 duration-100 ease-out hover:border-primary/20 hover:bg-primary/20">
        <div className="text-sm text-muted-foreground">GPU: {gpu}% | CPU: {cpu}%</div>
        <div className="m-auto w-fit text-muted-foreground">Model: {title}</div>
      </div>
      :
      null
  )
}
