import { useState } from 'react'

interface I_Endpoint {
  name: string
  urlPath: string
  method: string
}

interface I_API {
  name: string
  port: number
  endpoints: Array<I_Endpoint>
}

interface I_ServicesResponse {
  success: boolean
  message: string
  data: Array<I_API>
}

interface I_ConnectResponse {
  success: boolean
  message: string
  data: { docs: string }
}

type T_APIRequest = (props: any) => Promise<any | null>

export interface I_ServiceApis {
  'text-inference': {
    completions: T_APIRequest
    embeddings: T_APIRequest
    'chat-completions': T_APIRequest
    models: T_APIRequest
  }
}

// These will eventually be passed in from our server picker helper
const PORT = 8008
const hostname = 'http://localhost:'

const fetchConnect = async (): Promise<I_ConnectResponse | null> => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const res = await fetch(`${hostname}${PORT}/v1/connect`, options)
    if (!res.ok) throw new Error(`[homebrew] HTTP error! Status: ${res.status}`)
    if (!res) throw new Error('[homebrew] No response received.')
    return res.json()
  } catch (err) {
    console.log('[homebrew] connectToServer error:', err)
    return null
  }
}

const fetchAPIConfig = async (): Promise<I_ServicesResponse | null> => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    // @TODO This api url could come from the /connect endpoint
    const endpoint = '/v1/services/api'
    const res = await fetch(`${hostname}${PORT}${endpoint}`, options)
    if (!res.ok) throw new Error(`[homebrew] HTTP error! Status: ${res.status}`)
    if (!res) throw new Error(`[homebrew] No response from ${endpoint}`)
    return res.json()
  } catch (err) {
    console.log('[homebrew] fetchAPIConfig error:', err)
    return null
  }
}

export const connectToLocalProvider = async (): Promise<I_ConnectResponse | null> => {
  const conn = await fetchConnect()
  console.log('[homebrew] Connecting:', conn)

  const connected = conn?.success
  if (!connected) return null

  console.log(`[homebrew] Connected to local ai engine: ${conn.message}`)
  return conn
}

export const getAPIConfig = async () => {
  const config = await fetchAPIConfig()
  console.log('[homebrew] getAPIConfig:', config)

  const success = config?.success
  if (!success) return null

  const apis = config.data
  return apis
}

/**
 * Hook for Homebrew api that handles state and connections.
 */
export const useHomebrew = () => {
  const [apis, setAPI] = useState<I_ServiceApis | null>(null)

  const connect = async () => {
    const result = await connectToLocalProvider()
    if (!result?.success) return null

    await getServices()
    return result
  }

  const getServices = async () => {
    const res = await getAPIConfig()
    const serviceApis: any = {}
    res?.forEach(api => {
      const origin = `${hostname}${api.port}`
      const apiName = api.name
      const endpoints: { [key: string]: (args: any) => Promise<Response | null> } = {}
      // Parse endpoint urls
      api.endpoints.forEach(endpoint => {
        const url = `${origin}${endpoint.urlPath}`
        const method = endpoint.method
        const request = async (args: any) => {
          try {
            // Normal fetch
            const res = await fetch(url, {
              method,
              mode: 'cors', // no-cors, *, cors, same-origin
              cache: 'no-cache',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json',
              },
              redirect: 'follow',
              referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
              ...(method !== 'GET' && { body: JSON.stringify(args) }),
            })
            if (!res)
              throw new Error(`[homebrew] No response for endpoint ${endpoint.name}.`)
            if (!res.ok) {
              const parsed = await res.json()
              if (parsed.error) {
                const error = new Error(`[homebrew] ${parsed.error}`) as Error & {
                  status: number
                }
                error.status = res.status
                throw error
              } else {
                throw new Error(
                  `[homebrew] ${endpoint.name} An unexpected error occurred! Status: ${res.status}`,
                )
              }
            }

            return res
          } catch (err) {
            console.log(`[homebrew] Endpoint ${endpoint.name} error:`, err)
            return null
          }
        }

        endpoints[endpoint.name] = request
      })
      // Set callbacks
      serviceApis[apiName] = endpoints
    })
    setAPI(serviceApis)
    return
  }

  return { connect, getServices, apis }
}
