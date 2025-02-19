'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconMoon, IconSun } from '@/components/ui/icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [_isTransitioning, startTransition] = React.useTransition()

  React.useEffect(() => {
    setIsLoaded(true)
  }, [])

  return isLoaded ? (
    <Tooltip delayDuration={350}>
      <TooltipTrigger asChild>
        <Button
          className="pointer-events-auto"
          variant="ghost"
          size="icon"
          onClick={() => {
            startTransition(() => {
              setTheme(theme === 'light' ? 'dark' : 'light')
            })
          }}
        >
          {!theme || theme === 'dark' ? (
            <IconMoon className="transition-all" />
          ) : (
            <IconSun className="transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Toggle theme</TooltipContent>
    </Tooltip>
  ) : null
}
