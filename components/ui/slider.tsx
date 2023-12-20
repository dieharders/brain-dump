import { Root, Track, Range, Thumb } from '@radix-ui/react-slider'

interface I_Props {
  className?: string
  label?: string
  step?: number
  min?: number
  max?: number
  defaultValue?: number
}

export const Slider = ({ className, label = 'Slider', step = 0.1, min = 0, max = 1, defaultValue = 0 }: I_Props) => (
  <form className={className}>
    <Root className="relative flex h-8 w-full cursor-default touch-none items-center" defaultValue={[defaultValue]} max={max} min={min} step={step}>
      <Track className="relative h-1 flex-1 rounded bg-primary/50">
        <Range className="absolute h-full rounded bg-primary" />
      </Track>
      <Thumb className="block h-4 w-4 rounded-full bg-primary shadow-sm" aria-label={label} />
    </Root>
  </form>
)

