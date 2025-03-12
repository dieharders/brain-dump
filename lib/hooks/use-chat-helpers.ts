const SSE_DATA_PREFIX = 'data:'
const SSE_EVENT_PREFIX = 'event:'
const SSE_COMMENT_PREFIX = ':'

const processSseStream = async (
  fetchStream: Response,
  {
    onData,
    onFinish,
    onEvent,
    onComment,
  }: {
    onData: (str: string) => Promise<void>
    onFinish: (isDone: boolean) => Promise<void>
    onEvent?: (str: string) => Promise<void>
    onComment?: (str: string) => Promise<void>
  },
  abortRef = { current: false },
) => {
  const reader = fetchStream.body?.getReader()

  if (!reader) {
    return // If reader is not available
  }

  const decoder = new TextDecoder('utf-8')

  let readingBuffer = await reader.read()
  while (!readingBuffer.done && !abortRef.current) {
    try {
      const result =
        typeof readingBuffer.value === 'string'
          ? readingBuffer.value
          : decoder.decode(readingBuffer.value, { stream: true })

      const lines = result.split('\n')

      for (const line of lines) {
        if (line?.startsWith(SSE_COMMENT_PREFIX)) {
          const comment = line.slice(SSE_COMMENT_PREFIX.length).trim()
          await onComment?.(comment)
        }

        if (line?.startsWith(SSE_EVENT_PREFIX)) {
          const eventName = line.slice(SSE_EVENT_PREFIX.length).trim()
          await onEvent?.(eventName)
        }

        if (line?.startsWith(SSE_DATA_PREFIX)) {
          const eventData = line.slice(SSE_DATA_PREFIX.length).trim()
          await onData(eventData)
        }
      }
    } catch (err) {
      console.log('[UI] Error reading stream data buffer:', err)
    }

    readingBuffer = await reader.read()
  }

  await onFinish(readingBuffer.done)
  if (!readingBuffer.done) {
    await reader.cancel()
  }
}

export const useChatHelpers = () => {
  return { processSseStream }
}
