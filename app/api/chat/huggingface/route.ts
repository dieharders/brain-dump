import { auth } from '@/auth'
import { kv } from '@vercel/kv'
import { nanoid } from '@/lib/utils'
import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream, StreamingTextResponse } from 'ai'
// import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'

// Create a new Hugging Face Inference instance
const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export const runtime = 'edge'

/**
 * Send request to Hugging Face inference
 * https://sdk.vercel.ai/docs/guides/huggingface
 * https://huggingface.co/docs/api-inference/quicktour
 * https://huggingface.co/settings/tokens
 * https://api-inference.huggingface.co/dashboard/
 * Models list:
 * https://huggingface.co/models?sort=trending
 */
export async function POST(req: Request) {
  // Gate API
  const userId = (await auth())?.user.id
  if (!userId) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  // Extract the `messages` from the body of the request
  const { messages, model, id: chatId } = await req.json()

  // Initialize a text-generation stream using the Hugging Face Inference SDK
  const response = await Hf.textGenerationStream({
    model: model || 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    // inputs: experimental_buildOpenAssistantPrompt(messages),
    inputs: JSON.stringify(messages),
    parameters: {
      max_new_tokens: 200,
      /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
      // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
      typical_p: 0.2,
      repetition_penalty: 1,
      truncate: 1000,
      return_full_text: false,
    },
  })

  // Convert the async generator into a friendly text-stream
  const stream = HuggingFaceStream(response, {
    async onCompletion(completion) {
      const title = messages[0].content.substring(0, 100)
      const id = chatId ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant',
          },
        ],
      }
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`,
      })
    },
  })

  // Respond with the stream, enabling the client to consume the response
  return new StreamingTextResponse(stream)
}
