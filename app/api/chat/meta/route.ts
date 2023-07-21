import { auth } from '@/auth'
import { client as gradio, SpaceStatus } from '@gradio/client'

export const runtime = 'edge'

/**
 * Send request to a local Gradio app instance running Llama v2 inference
 * https://www.npmjs.com/package/@gradio/client?activeTab=readme
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
  const { messages } = await req.json()

  // Init the Gradio app
  const space = 'https://ysharma-explore-llamav2-with-tgi.hf.space/'
  const inference = await gradio(space, {
    status_callback: (space_status: SpaceStatus) =>
      console.log('@@ status:', space_status),
  })

  // Get info about the api endpoints
  //   const app_info = await inference.view_api()

  // Get output from prediction
  const result = await inference.predict('/chat', messages)

  return result
}
