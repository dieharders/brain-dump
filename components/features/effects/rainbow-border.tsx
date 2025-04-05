import { cn } from '@/lib/utils'
import './rainbow-border.css'

const gradientRot = {
  'aspectRatio': '1 / 1',
  'clipPath': 'border-box',
  'background': 'conic-gradient(from 60deg, #14ffe9, #ffeb3b, #ff00e0, #14ffe9)',
  'animation': 'rot 2s linear infinite',
}

const Gradient = ({ size = 1 }: { size?: number }) => {
  return (
    <div className="absolute flex h-full w-full overflow-hidden" style={{ 'filter': `blur(${size}px)` }}>
      <div className="relative h-full w-full self-center">
        <div className="absolute left-[-30%] top-[-750%] h-[1000px] w-[1000px]" style={gradientRot}></div>
      </div>
    </div>
  )
}

export const RainbowBorderCone = ({ disabled = true, children, className }: { disabled?: boolean, children: JSX.Element, className?: string }) => {
  return disabled ? children : (
    <div className={cn('relative', className)}>
      <Gradient size={1} />
      <Gradient size={2} />
      <Gradient size={4} />
      <Gradient size={14} />
      {children}
    </div>
  )
}

export const RainbowBorderSlide = ({ disabled = true, children, className }: { disabled?: boolean, children: JSX.Element, className?: string }) => {
  const containerClass = cn('absolute left-0 top-0 h-full w-full')
  const containerStyle = {
    'background': 'linear-gradient(70deg, #14ffe9, #ffeb3b, #ff00e0)',
  }
  const glowStyle = {
    'animation': 'animate 1s linear infinite',
    'background-size': '150% 150%',
  }

  return disabled ? children : (
    <div className={cn('relative rounded p-0', className)} style={containerStyle}>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(2px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(4px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(8px)' }}></span>
      <span className={containerClass} style={{ ...containerStyle, ...glowStyle, 'filter': 'blur(18px)' }}></span>
      {children}
    </div>
  )
}
