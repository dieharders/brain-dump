'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'
import { ChatList } from '@/components/features/chat/chat-list'
import { ChatPage } from '@/components/features/chat/chat-page'
import { EmptyScreen } from '@/components/features/chat/chat-empty-screen'
import { ChatScrollAnchor } from '@/components/features/chat/chat-scroll-anchor'
import { useLocalInference } from '@/lib/hooks/use-local-chat'
import { I_Text_Settings } from '@/lib/homebrew'
import { LavaLamp } from "@/components/features/backgrounds/lava-lamp"

interface IProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  routeId?: string
  isLoading?: boolean
  settings?: I_Text_Settings
  setSettings?: Dispatch<SetStateAction<I_Text_Settings>>
}

export const LocalChat = (props: IProps) => {
  const { theme } = useTheme()
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const { id, routeId, initialMessages, isLoading: isModelLoading, className, settings, setSettings = () => { } } = props
  const { append, messages, reload, stop, input, setInput, isLoading: isChatLoading } =
    useLocalInference({
      initialMessages,
      settings,
    })
  const isLoading = isModelLoading || isChatLoading
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  // Render

  if (!hasMounted) return null

  return (
    <div className={wrapperStyle}>
      <LavaLamp />
      <div className={cn('relative w-full pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPage
        id={id}
        routeId={routeId}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        theme={theme}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  )
}
