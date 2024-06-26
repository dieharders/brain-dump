import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@/components/ui/icons'
import { useChatContext } from '@/contexts'

const exampleMessages = [
  {
    heading: 'Explain technical concepts',
    message: `What is a "serverless function"?`
  },
  {
    heading: 'Summarize an article',
    message: 'Summarize the following article for a 2nd grader: \n'
  },
  {
    heading: 'Draft an email',
    message: `Draft an email to my boss about the following: \n`
  },
  {
    heading: 'Ask for help',
    message: `/help `
  }
]

export const EmptyScreen = () => {
  const { setPromptInput } = useChatContext()

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background/80 p-8">
        <h1 className="mb-2 text-lg font-semibold">
          What can I help you with?
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Enter a prompt below to start a conversation or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setPromptInput(message.message)}
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
