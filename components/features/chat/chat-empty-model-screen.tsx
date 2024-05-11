import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { useRouter } from "next/navigation"

interface I_Props {
  id: string
  loadModel: (() => Promise<void>) | ((id: string) => Promise<void>) | undefined
}

export const EmptyModelScreen = ({ id, loadModel }: I_Props) => {
  const router = useRouter()
  const messages = [
    {
      heading: 'Reload model',
      onClick: () => loadModel?.(id),
    },
    {
      heading: 'Go to main menu',
      onClick: () => router.replace('home'),
    },
    {
      heading: 'Ask for help',
      onClick: () => router.replace('/help'),
    }
  ]

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          No Ai model detected
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Something may have gone wrong. Try these alternatives:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {messages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={message.onClick}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
