'use client'

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import './lava-lamp.css'

const colors = ['#abdcff', '#0396ff', '#8e7ceb', '#e97aab']
const particleNum = 20

const getRandomInteger = (min: number, max: number) => {
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

const getRandomColor = (colors: string[]) => {
  const randomIndex = Math.floor(Math.random() * colors.length)
  return colors[randomIndex]
}

// https://codepen.io/Mamboleoo/pen/BxMQYQ
export const LavaLamp = ({ className }: { className?: string }) => {
  const setSpans = () => {
    const spans = []
    for (let i = 0; i < particleNum; i++) {
      const color = getRandomColor(colors)
      const pSize = getRandomInteger(6, 28)
      const particleSize = `${pSize}rem`
      const top = `${getRandomInteger(20, 80)}%`
      const left = `${getRandomInteger(20, 80)}%`
      const origin = `${getRandomInteger(-16, 16)}rem ${getRandomInteger(-16, 16)}rem 0px`
      const border = getRandomColor(['rounded-2xl', 'rounded-full'])
      const blurRadius = `${getRandomInteger(8, 12)}rem`
      const spanStyle = cn(border, "absolute")
      const shadowDistance = `${getRandomInteger(pSize * 2, pSize * 2 + 24)}rem`
      const animDuration = `${getRandomInteger(16, 32)}s`
      const animDelay = `${getRandomInteger(-6, -1)}s`

      spans.push(
        <span
          key={i}
          className={spanStyle}
          style={{
            'backfaceVisibility': 'hidden',
            'animationName': 'move',
            'animationTimingFunction': 'linear',
            'animationIterationCount': 'infinite',
            'width': particleSize,
            'height': particleSize,
            'color': color,
            'top': top,
            'left': left,
            'animationDuration': animDuration,
            'animationDelay': animDelay,
            'transformOrigin': origin,
            'boxShadow': `${shadowDistance} 0 ${blurRadius} currentColor`,
          }}></span>
      )
    }
    return spans
  }

  const spans = useMemo(() => setSpans(), [])

  return (
    <div className={cn("h-100 inset-0 m-0 w-screen overflow-hidden border-0 opacity-50", className)}>
      {...spans}
    </div>
  )
}
