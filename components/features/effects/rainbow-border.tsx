import { cn } from '@/lib/utils'
import './rainbow-border.css'

// @TODO Add gradients per side and animate
const containerStyle = {
  'background': 'linear-gradient(70deg, #14ffe9, #ffeb3b, #ff00e0)',
}

const glowStyle = {
  'animation': 'animate 1s linear infinite',
  'background-size': '150% 150%',
}

export const RainbowBorder = ({ disabled = true, children, className }: { disabled?: boolean, children: JSX.Element, className?: string }) => {
  const containerClass = cn("absolute left-0 top-0 h-full w-full rounded")
  return disabled ? children : (
    <div className={cn("relative rounded p-0", className)} style={containerStyle}>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(2px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(4px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(8px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(24px)' }}></span>
      {children}
    </div>
  )
}
