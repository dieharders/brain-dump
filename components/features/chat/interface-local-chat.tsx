'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'
import { ChatList } from '@/components/features/chat/chat-list'
import { ChatPage } from '@/components/features/chat/chat-page'
import { EmptyScreen } from '@/components/features/chat/chat-empty-screen'
import { ChatScrollAnchor } from '@/components/features/chat/chat-scroll-anchor'
import { useLocalInference } from '@/lib/hooks/use-local-chat'
import { I_Text_Settings } from '@/lib/homebrew'
import { LavaLamp } from "@/components/features/backgrounds/lava-lamp"
import { useGlobalContext } from '@/contexts'
import { ChatContextProvider } from '@/contexts/chat-context'

interface IProps extends React.ComponentProps<'div'> {
  routeId?: string
  isLoading?: boolean
  settings: I_Text_Settings
}

// @TODO Rename file to chat-menu-local
export const LocalChat = (props: IProps) => {
  const { routeId, isLoading: isModelLoading, settings, className } = props
  const { isAiThinking, threads, currentThreadId } = useGlobalContext()
  const { theme } = useTheme()
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const { append, reload, stop } = useLocalInference({ settings })
  const isLoading = isModelLoading || isAiThinking
  const [hasMounted, setHasMounted] = useState(false)
  const messages = threads.find(t => t.id === currentThreadId.current)?.messages || []

  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  // Render

  if (!hasMounted) return null

  return (
    <div className={wrapperStyle}>
      {/* Render a background */}
      <LavaLamp className="fixed left-0 top-0" />
      <ChatContextProvider>
        {/* Messages list */}
        <div className={cn('relative w-full pb-[200px] pt-4 md:pt-10', className)}>
          {messages.length ? (
            <>
              <ChatList messages={messages} theme={theme} />
              <ChatScrollAnchor trackVisibility={isLoading} />
            </>
          ) : (
            <EmptyScreen />
          )}
        </div>
        {/* Prompt menu */}
        <ChatPage
          routeId={routeId}
          isLoading={isLoading}
          stop={stop}
          append={append}
          reload={reload}
          messages={messages}
          theme={theme}
        />
      </ChatContextProvider>
    </div>
  )
}
