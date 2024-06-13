'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'
import { ChatList } from '@/components/features/chat/chat-list'
import { ChatPromptMenu } from '@/components/features/chat/chat-prompt-menu'
import { EmptyScreen } from '@/components/features/chat/chat-empty-screen'
import { ChatScrollAnchor } from '@/components/features/chat/chat-scroll-anchor'
import { I_Session, useLocalInference } from '@/lib/hooks/use-local-chat'
import { I_Text_Settings } from '@/lib/homebrew'
import { LavaLamp } from "@/components/features/backgrounds/lava-lamp"
import { useGlobalContext } from '@/contexts'
import { ChatContextProvider } from '@/contexts/chat-context'

interface I_Props extends React.ComponentProps<'div'> {
  routeId?: string
  isLoading?: boolean
  settings: I_Text_Settings | undefined
  session: I_Session
}

export const ChatPageLocal = (props: I_Props) => {
  const { routeId, isLoading: isModelLoading, settings, session, className } = props
  const { isAiThinking, currentMessages } = useGlobalContext()
  const { theme } = useTheme()
  const wrapperStyle = useMemo(() => constructMainBgStyle(theme), [theme])
  const { append, reload, stop } = useLocalInference({ settings, session })
  const isLoading = isModelLoading || isAiThinking
  const [hasMounted, setHasMounted] = useState(false)

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
          {currentMessages.length ? (
            <>
              <ChatList messages={currentMessages} theme={theme} />
              <ChatScrollAnchor trackVisibility={isLoading} />
            </>
          ) : (
            <EmptyScreen />
          )}
        </div>
        {/* Prompt menu */}
        <ChatPromptMenu
          routeId={routeId}
          isLoading={isLoading}
          stop={stop}
          append={append}
          reload={reload}
          messages={currentMessages}
          session={session}
          theme={theme}
        />
      </ChatContextProvider>
    </div>
  )
}
