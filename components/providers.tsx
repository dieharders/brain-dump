'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalContextProvider } from '@/contexts/global-context'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <GlobalContextProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </GlobalContextProvider>
    </NextThemesProvider>
  )
}
