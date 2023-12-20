import { cn } from "@/lib/utils"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Button } from "./button"
import { PopOver } from "./pop-over"

interface I_Props {
  children: React.ReactNode
  label?: string
  className?: string
}

export const Info = ({ label = 'Info', children, className }: I_Props) => {
  const trigger = (
    <Button
      title={label}
      className={cn("flex h-6 w-6 cursor-default flex-col items-center justify-center self-center rounded-sm bg-muted/60 p-1 text-primary/50 hover:bg-muted", className)}
    >
      <InfoCircledIcon className="h-auto w-auto" />
    </Button>
  )

  return <PopOver trigger={trigger}>{children}</PopOver>
}

export const Highlight = ({ children }: { children: React.ReactNode }) => {
  return <span className="w-fit bg-indigo-950 px-1 text-indigo-400">{children}</span>
}
