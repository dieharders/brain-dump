import { ThemeToggle } from '@/components/core/theme-toggle'
import { UserMenu } from '@/components/features/menus/user-menu'
import { MenuPanelTriggers } from '@/components/features/layout/menu-panel-triggers'
import { ModelReadout } from '@/components/features/layout/model-readout'
import { AuthRoute } from '@/components/core/auth-route'

export async function Header() {
  const Fallback = () => {
    return (
      <div className="pointer-events-none z-50 flex h-16 w-full items-center justify-between gap-2 px-4">
        <div className="flex w-full flex-row items-center justify-end gap-x-2">
          <ThemeToggle />
        </div>
      </div>
    )
  }
  return (
    <AuthRoute fallback={<Fallback />}>
      <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background/70 px-4 backdrop-blur-md">
        {/* Left side */}
        <MenuPanelTriggers />

        {/* Middle section */}
        <ModelReadout />

        {/* Right side */}
        <div className="flex w-max items-center justify-end gap-x-2">
          {/* Account Menu */}
          <UserMenu />
          {/* Light/Dark Mode */}
          <ThemeToggle />
        </div>
      </header>
    </AuthRoute>
  )
}
