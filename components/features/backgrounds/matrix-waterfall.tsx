'use client'

import { cn } from "@/lib/utils"
import { useEffect, useMemo, useRef } from "react"

// Draw matrix effect
const matrix = (ctx: any, w: any, h: any, ypos: any) => {
  // Draw a semitransparent black rectangle on top of previous drawing
  if (ctx?.fillStyle) ctx.fillStyle = '#0001'
  if (ctx?.fillRect) ctx.fillRect(0, 0, w, h)

  // Set color to green and font to 15pt monospace in the drawing context
  if (ctx?.fillStyle) ctx.fillStyle = '#0f0'
  if (ctx?.font) ctx.font = '15pt monospace'

  // for each column put a random character at the end
  ypos.forEach((y: number, ind: number) => {
    // generate a random character
    const text = String.fromCharCode(Math.random() * 128)

    // x coordinate of the column, y coordinate is already given
    const x = ind * 20
    // render the character at (x, y)
    if (ctx?.fillText) ctx.fillText(text, x, y)

    // randomly reset the end of the column if it's at least 100px high
    if (y > 100 + Math.random() * 10000) ypos[ind] = 0
    // otherwise just move the y coordinate for the column 20px down,
    else ypos[ind] = y + 20
  })
}

export const MatrixWaterfall = ({ className }: { className?: string }) => {
  // Get the canvas node and the drawing context
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>(null)

  // set the width and height of the canvas
  const w = canvas?.current?.width || document.body.offsetWidth
  const h = canvas?.current?.height || document.body.offsetHeight

  // draw a black rectangle of width and height same as that of the canvas
  if (ctx.current?.fillStyle) ctx.current.fillStyle = '#0001'
  if (ctx.current?.fillRect) ctx.current.fillRect(0, 0, w, h)
  // if (ctx.current?.globalCompositeOperation) ctx.current.globalCompositeOperation = 'destination-over'

  const cols = useMemo(() => Math.floor(w / 20) + 1, [w])
  const ypos = useMemo(() => Array(cols).fill(0), [cols])

  useEffect(() => {
    // render the animation at 20 FPS.
    setInterval(() => matrix(ctx.current, w, h, ypos), 50)
  }, [h, w, ypos])

  useEffect(() => {
    if (canvas.current) ctx.current = canvas.current?.getContext('2d')
  }, [])

  return (
    <div className={cn("h-100 inset-0 m-0 w-screen overflow-hidden border-0 mix-blend-screen", className)}>
      <canvas ref={canvas} className="h-full" width={4000} height={1000} />
    </div>
  )
}
