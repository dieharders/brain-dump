'use client'

import { Dispatch, SetStateAction } from 'react'
import { type Message } from 'ai/react'
import { useTheme } from 'next-themes'
import { cn, constructMainBgStyle } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalInference } from '@/lib/hooks/use-local-chat'
import { I_ServiceApis, I_Text_Settings } from '@/lib/homebrew'

interface IProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  services: I_ServiceApis | null
  isModelLoading?: boolean
  settings?: I_Text_Settings
  setSettings?: Dispatch<SetStateAction<I_Text_Settings>> // @TODO This should be a useRef() to not trigger re-render ?
}

export const LocalChat = (props: IProps) => {
  const { theme } = useTheme()
  const wrapperStyle = constructMainBgStyle(theme)
  const { id, initialMessages, services, isModelLoading, className, settings, setSettings = () => { } } = props
  const { append, messages, reload, stop, input, setInput, isLoading: isChatLoading } =
    useLocalInference({
      initialMessages,
      services,
      settings,
    })
  const isLoading = isModelLoading || isChatLoading

  return (
    <div className={wrapperStyle}>
      <div className={cn('w-full pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
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
