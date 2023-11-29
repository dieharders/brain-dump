import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'

interface I_Props {
  onClick: () => void
}

export const CharmMenuButton = ({ onClick }: I_Props) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        buttonVariants({ size: 'sm', variant: 'outline' }),
        'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4',
      )}
    >
      <IconPlus className="text-foreground" />
      <span className="sr-only">Prompt Options Menu</span>
    </Button>
  )
}
