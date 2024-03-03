import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { useRouter } from "next/navigation"

export const EmptyModelScreen = () => {
  const router = useRouter()
  const messages = [
    {
      heading: 'Enter the Playground',
      onClick: () => router.replace('/'),
    },
    {
      heading: 'Load a ChatBot',
      onClick: () => router.replace('/'),
    },
    {
      heading: 'Ask for help',
      onClick: () => router.replace('/help'),
    }
  ]

  const HomeButton = () => {
    return (
      <Button
        className="text-md m-0 p-0 font-semibold text-foreground"
        variant="link"
        onClick={() => router.replace('/')}
      >here</Button>
    )
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          You have not loaded an Ai model.
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Go <HomeButton /> to choose a model or try these alternatives:
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
