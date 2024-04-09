import { cn } from "@/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"

export const useRenderText = () => {
  const defaultGray = 'text-gray-400'
  const tagUnderlineColorTable = useMemo(() => ['decoration-red-500', 'decoration-indigo-500', 'decoration-cyan-500', 'decoration-green-500', 'decoration-pink-500', 'decoration-purple-500', 'decoration-fuchsia-500', 'decoration-blue-500', 'decoration-yellow-500', 'decoration-orange-500', 'decoration-sky-500'], [])
  const [randIndex, setRandIndex] = useState<number>(-1)

  const getOffsetIndex = (arr: string[], index: number, offset: number) => {
    if (offset < 0) offset = 0
    let newIndex = index + offset

    if (newIndex >= 0 && newIndex < arr.length) {
      return newIndex
    }

    // Handle cases where the new index goes outside array bounds
    while (newIndex > arr.length - 1) {
      newIndex = newIndex - arr.length
      if (newIndex > 0) newIndex - 1
    }

    return newIndex
  }

  const getRandomTagColor = useCallback((index: number, table: string[], metaLen: number) => {
    if (randIndex === -1) return defaultGray
    if (metaLen === 0) return defaultGray
    const offsetIndex = getOffsetIndex(table, index, randIndex)
    const randColor = table[offsetIndex]
    return randColor
  }, [randIndex])

  const RandomUnderlinedText = ({ text, className }: { text: string, className?: string }) => {
    const metaLen = text.length
    const tagColor = metaLen ? 'text-white' : defaultGray
    const tagUnderline = metaLen ? 'underline decoration-2' : ''
    const result = text.split(' ').map((tag, index) => {
      return (
        <p key={tag} className={cn(tagColor, tagUnderline, "w-fit text-left font-semibold", getRandomTagColor(index, tagUnderlineColorTable, metaLen), className)}>
          {tag}
        </p>
      )
    })
    return result
  }

  // Set a random number for this to offset the color index
  // This way tags colors dont all look the same
  useEffect(() => {
    const max = tagUnderlineColorTable.length - 1
    const randomIndex = Math.floor((Math.random() * max))
    if (randIndex === -1) setRandIndex(randomIndex)
  }, [randIndex, tagUnderlineColorTable.length])

  return {
    RandomUnderlinedText,
  }
}
