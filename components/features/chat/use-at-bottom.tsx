import { useEffect, useState } from "react"

export function useAtBottom(offset = 0) {
  const [isAtBottom, setIsAtBottom] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // Prevent showing if window height is very small
      if (document.body.offsetHeight - window.innerHeight <= 1) {
        setIsAtBottom(true)
        return
      }
      setIsAtBottom(
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - offset
      )
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [offset])

  return { isAtBottom }
}
