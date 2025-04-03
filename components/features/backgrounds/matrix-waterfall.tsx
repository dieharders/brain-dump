'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

export const MatrixWaterfall = ({ padding = 20, fontSize = 15, className }: { padding?: number, fontSize?: number, className?: string }) => {
  // Get the canvas node and the drawing context
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  // const color_green = '#0f0'
  const color_blue = '#00bcff'
  const color_semi_black = '#0001'
  const color_black = '#000'

  // Set the width and height of the canvas
  let w = 0, h = 0
  if (hasMounted) {
    w = window ? window?.screen?.width : 0
    h = window ? window?.screen?.height : 0
  }

  // Draw a black rectangle of width and height same as that of the canvas
  if (ctx.current?.fillStyle) ctx.current.fillStyle = color_black
  if (ctx.current?.fillRect) ctx.current.fillRect(0, 0, w, h)
  // if (ctx.current?.globalCompositeOperation) ctx.current.globalCompositeOperation = 'destination-over'

  const cols = Math.floor(w / padding) + 1
  const ypos = Array(cols).fill(0)

  // Draw matrix effect
  const matrix = () => {
    // Draw a semitransparent black rectangle on top of previous drawing
    if (ctx.current?.fillStyle) ctx.current.fillStyle = color_semi_black
    if (ctx.current?.fillRect) ctx.current.fillRect(0, 0, w, h)

    // Set color to green and font to 15pt monospace in the drawing context
    if (ctx.current?.fillStyle) ctx.current.fillStyle = color_blue
    if (ctx.current?.font) ctx.current.font = `${fontSize}pt monospace`

    // for each column put a random character at the end
    ypos.forEach((y, ind) => {
      // generate a random character
      const text = String.fromCharCode(Math.random() * 128)

      // x coordinate of the column, y coordinate is already given
      const x = ind * padding
      // render the character at (x, y)
      if (ctx.current?.fillText) ctx.current.fillText(text, x, y)

      // randomly reset the end of the column if it's at least 100px high
      if (y > 100 + Math.random() * 10000) ypos[ind] = 0
      // otherwise just move the y coordinate for the column `padding` down,
      else ypos[ind] = y + padding
    })
  }

  // Render the animation
  const timer = setInterval(matrix, 60)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setHasMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      timer && clearInterval(timer)
    }
  }, [timer])

  useEffect(() => {
    if (canvas.current) ctx.current = canvas.current?.getContext('2d')
  }, [])

  return (
    <div className={cn('absolute inset-0 h-full w-full overflow-hidden mix-blend-screen', className)}>
      <canvas ref={canvas} width={w} height={h} />
    </div>
  )
}
