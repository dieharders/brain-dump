import { cn } from "@/lib/utils"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Button } from "./button"
import { PopOver } from "./pop-over"

interface I_Props {
  children: React.ReactNode
  label?: string
  className?: string
}

export const InfoLink = ({ label = 'Info', title, children, className }: I_Props & { title: string }) => {
  const trigger = (
    <Button
      variant="link"
      title={label}
      className={cn("m-0 flex cursor-pointer flex-col items-center justify-center self-center p-0 shadow-none", className)}
    >
      {title}
    </Button>
  )

  return <PopOver trigger={trigger}>{children}</PopOver>
}

export const Info = ({ label = 'Info', children, className }: I_Props) => {
  const trigger = (
    <Button
      title={label}
      className={cn("flex h-6 w-6 cursor-default flex-col items-center justify-center self-center rounded-sm bg-muted/60 p-1 text-neutral-500 shadow-none hover:bg-muted", className)}
    >
      <InfoCircledIcon className="h-full w-full" />
    </Button>
  )

  return <PopOver trigger={trigger}>{children}</PopOver>
}

export const Highlight = ({ children }: { children: React.ReactNode }) => {
  return <span className="w-fit font-semibold text-indigo-700 dark:bg-indigo-950 dark:px-1 dark:text-indigo-400">{children}</span>
}
