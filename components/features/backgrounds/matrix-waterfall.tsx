'use client'

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

export const MatrixWaterfall = ({ className }: { className?: string }) => {
  // Get the canvas node and the drawing context
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)

  // Set the width and height of the canvas
  const w = window.screen.width
  const h = window.screen.height

  // Draw a black rectangle of width and height same as that of the canvas
  if (ctx.current?.fillStyle) ctx.current.fillStyle = '#000'
  if (ctx.current?.fillRect) ctx.current.fillRect(0, 0, w, h)
  // if (ctx.current?.globalCompositeOperation) ctx.current.globalCompositeOperation = 'destination-over'

  const cols = Math.floor(w / 20) + 1
  const ypos = Array(cols).fill(0)

  // Draw matrix effect
  const matrix = () => {
    // Draw a semitransparent black rectangle on top of previous drawing
    if (ctx.current?.fillStyle) ctx.current.fillStyle = '#0001'
    if (ctx.current?.fillRect) ctx.current.fillRect(0, 0, w, h)

    // Set color to green and font to 15pt monospace in the drawing context
    if (ctx.current?.fillStyle) ctx.current.fillStyle = '#0f0'
    if (ctx.current?.font) ctx.current.font = '15pt monospace'

    // for each column put a random character at the end
    ypos.forEach((y, ind) => {
      // generate a random character
      const text = String.fromCharCode(Math.random() * 128)

      // x coordinate of the column, y coordinate is already given
      const x = ind * 20
      // render the character at (x, y)
      if (ctx.current?.fillText) ctx.current.fillText(text, x, y)

      // randomly reset the end of the column if it's at least 100px high
      if (y > 100 + Math.random() * 10000) ypos[ind] = 0
      // otherwise just move the y coordinate for the column 20px down,
      else ypos[ind] = y + 20
    })
  }

  // Render the animation
  const timer = setInterval(matrix, 60)

  useEffect(() => {
    return () => {
      timer && clearInterval(timer)
    }
  }, [timer])

  useEffect(() => {
    if (canvas.current) ctx.current = canvas.current?.getContext('2d')
  }, [])

  return (
    <div className={cn("absolute inset-0 h-full w-full overflow-hidden mix-blend-screen", className)}>
      <canvas ref={canvas} width={4000} height={4000} />
    </div>
  )
}
