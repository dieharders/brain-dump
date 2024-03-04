import Link from 'next/link'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { IconNextChat } from '@/components/ui/icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { MenuPanelTriggers } from '@/components/features/layout/menu-panel-triggers'
import { ModelReadout } from '@/components/features/layout/model-readout'

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background/70 px-4 backdrop-blur-xl">
      {/* Left side */}
      {session?.user ? (
        // Shortcuts, utility panels
        <MenuPanelTriggers session={session} />
      ) : (
        // Login
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="mr-2 h-6 w-6 dark:hidden" inverted />
          <IconNextChat className="mr-2 hidden h-6 w-6 dark:block" />
        </Link>
      )}

      {/* Middle */}
      <ModelReadout />

      {/* Right side */}
      <div className="flex w-max items-center justify-end gap-x-2">
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
