'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export const BrandText = () => {
  const { theme } = useTheme()
  const icon = theme === 'dark' ? '🍺' : '☕'
  const [hasMounted, setHasMounted] = useState(false)

  // Make sure this is client side, otherwise theme is used incorrect
  useEffect(() => {
    if (hasMounted) return
    typeof theme === 'string' && setHasMounted(true)
  }, [hasMounted, theme])

  if (!hasMounted) return null
  return <div className="w-full text-xl font-semibold">Obrew{icon}Studio</div>
}
