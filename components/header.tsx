import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { IconNextChat } from '@/components/ui/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChatsButton } from '@/components/features/panels/chats-panel-button'
import { CollectionsButton } from '@/components/features/panels/collections-panel-button'

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/70 px-4 backdrop-blur-xl">
      {session?.user ? (
        <div className="flex items-center">
          {/* Chats Pane Button */}
          <Tooltip delayDuration={450}>
            <TooltipTrigger asChild>
              <div>
                <ChatsButton session={session} />
                <span className="sr-only">Chat History</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Chats</TooltipContent>
          </Tooltip>
          {/* Brains Pane Button */}
          <Tooltip delayDuration={450}>
            <TooltipTrigger asChild>
              <div>
                <CollectionsButton session={session} />
                <span className="sr-only">Explore Ai memories</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Memories</TooltipContent>
          </Tooltip>
        </div>
      ) : (
        // Login
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="mr-2 h-6 w-6 dark:hidden" inverted />
          <IconNextChat className="mr-2 hidden h-6 w-6 dark:block" />
        </Link>
      )}
      {/* Right side */}
      <div className="flex items-center justify-end gap-x-2">
        {/* Account Menu */}
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild>
            <Link href="/sign-in?callbackUrl=/">Login</Link>
          </Button>
        )}
        {/* Light/Dark Mode */}
        <ThemeToggle />
      </div>
    </header>
  )
}
