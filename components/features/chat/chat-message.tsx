import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/ui/markdown'
import { IconUser, SpinnerBlocks, ObrewAiIcon } from '@/components/ui/icons'
import { ChatMessageActions } from '@/components/features/chat/chat-message-actions'
import { I_Message } from '@/lib/homebrew'

export interface ChatMessageProps {
  isLoading: boolean
  message: I_Message
  theme?: string | undefined
}

export const ChatMessage = ({ isLoading, message, theme, ...props }: ChatMessageProps) => {
  const bgStyle = message.role === 'user' ? 'bg-accent/80' : 'bg-background/80'

  return (
    <div
      className={cn('group relative mb-4 flex items-start md:-ml-12')}
      {...props}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-md border shadow',
          message.role === 'user'
            ? 'bg-background'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser /> : <ObrewAiIcon />}
      </div>
      <div className={`ml-4 flex-1 space-y-2 overflow-hidden rounded px-3 py-2 ${bgStyle}`}>
        {
          message.content ?
            <MemoizedReactMarkdown
              className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
              remarkPlugins={[remarkGfm, remarkMath]}
              components={{
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                code({ node, inline, className, children, ...props }) {
                  if (children.length) {
                    // @TODO Is this special char causing the multi-byte char issue ?
                    if (children[0] == '▍') {
                      return (
                        <span className="mt-1 animate-pulse cursor-default">▍</span>
                      )
                    }

                    children[0] = (children[0] as string).replace('`▍`', '▍')
                  }

                  const match = /language-(\w+)/.exec(className || '')

                  if (inline) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }

                  return (
                    <CodeBlock
                      key={Math.random()}
                      language={(match && match[1]) || ''}
                      value={String(children).replace(/\n$/, '')}
                      {...props}
                    />
                  )
                }
              }}
            >
              {message.content}
            </MemoizedReactMarkdown> :
            isLoading ? <SpinnerBlocks theme={theme} /> : <div>...</div>
        }
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
