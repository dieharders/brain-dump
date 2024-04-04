import { auth } from '@/auth'
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
        <div></div>
      )}

      {/* Middle section */}
      {session?.user ?
        <ModelReadout />
        :
        <div className="w-full text-xl font-semibold">Obrew🍺Studio</div>
      }

      {/* Right side */}
      <div className="flex w-max items-center justify-end gap-x-2">
        {/* Account Menu */}
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <div></div>
        )}
        {/* Light/Dark Mode */}
        <ThemeToggle />
      </div>
    </header>
  )
}
