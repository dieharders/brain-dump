export const runtime = 'edge'

/**
 * Send request to a local Gradio app instance running Llama v2 inference
 * https://www.npmjs.com/package/@gradio/client?activeTab=readme
 */
export async function POST(_req: Request) {
  // Get output from prediction
  // const result = await inference.predict('/chat', messages)

  return 'result'
}
