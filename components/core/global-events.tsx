'use client'

import { useEffect } from 'react'

export const GlobalEvents = () => {
  useEffect(() => {
    const toggleFullScreen = () => {
      try {
        (window as any).pywebview.api.toggle_fullscreen()
      } catch (e) {
        console.error(`Fullscreen err: ${e}`)
      }
    }

    const handleKeyDown = (event: any) => {
      // Handle the keydown event here
      if (event.key === 'F11') toggleFullScreen()
    }

    document.body.addEventListener('keyup', handleKeyDown)

    // Clean up the event listener when the component unmounts
    return () => {
      document.body.removeEventListener('keyup', handleKeyDown)
    }
  }, [])

  return null
}
