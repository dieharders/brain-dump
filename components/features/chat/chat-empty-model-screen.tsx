import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'

interface I_Props {
  id: string
  loadModel?: (() => Promise<any>) | undefined
}

export const EmptyModelScreen = ({ loadModel }: I_Props) => {
  const router = useRouter()
  const messages = [
    {
      heading: 'Reload model',
      onClick: () => loadModel?.(),
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
    <div className="mx-auto flex h-full w-full flex-1 flex-col items-center justify-center bg-primary/10 px-4">
      {loadModel &&
        <div className="max-w-2xl rounded-lg border bg-secondary/70 p-8">
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
      }
    </div>
  )
}
