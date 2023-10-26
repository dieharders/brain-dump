import { useCallback, useState } from 'react'

interface I_Endpoint {
  name: string
  urlPath: string
  method: string
  // completions
  promptTemplate?: string
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

type T_APIRequest = (props?: any) => Promise<any | null>

export interface I_ServiceApis {
  textInference: {
    completions: T_APIRequest
    embeddings: T_APIRequest
    chatCompletions: T_APIRequest
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

const createServices = (response: I_API[] | null): I_ServiceApis | null => {
  if (!response) return null

  const serviceApis: any = {}
  response?.forEach(api => {
    const origin = `${hostname}${api.port}`
    const apiName = api.name
    const endpoints: { [key: string]: (args: any) => Promise<Response | null> } = {}
    // Parse endpoint urls
    api.endpoints.forEach(endpoint => {
      const url = `${origin}${endpoint.urlPath}`
      const method = endpoint.method
      const headers = {
        'Content-Type': 'application/json',
      }
      const request = async (args: any) => {
        try {
          // Normal fetch
          const body = { body: JSON.stringify(args) }
          const res = await fetch(url, {
            method,
            mode: 'cors', // no-cors, *, cors, same-origin
            cache: 'no-cache',
            credentials: 'same-origin',
            headers,
            redirect: 'follow',
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            ...(method !== 'GET' && body),
          })
          // Check no response
          if (!res)
            throw new Error(`[homebrew] No response for endpoint ${endpoint.name}.`)
          // Check errored response
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

      // Add request function
      const reqFunction = async (args: any) => {
        // This is specific to constructing prompts, only applies to "completions"
        const prompt = endpoint?.promptTemplate?.replace('{{PROMPT}}', args?.prompt)
        const newArgs = args?.prompt ? { ...args, prompt } : args

        return request(newArgs)
      }
      endpoints[endpoint.name] = reqFunction
    })
    // Set api callbacks
    serviceApis[apiName] = endpoints
  })

  return serviceApis
}

/**
 * Hook for Homebrew api that handles state and connections.
 */
export const useHomebrew = () => {
  const [apis, setAPI] = useState<I_ServiceApis | null>(null)

  /**
   * Attempt to connect to homebrew api.
   */
  const connect = async () => {
    if (!window?.homebrewai) window.homebrewai = {}
    // Track the initial attempt at a connection
    window.homebrewai.hasInitConnection = true

    const result = await connectToLocalProvider()
    if (!result?.success) return null

    // Track that we have successfully connected
    window.homebrewai.connected = true

    // Return api services
    await getServices()

    return result
  }

  /**
   * Attempt to connect to text inference server.
   */
  const connectTextService = useCallback(async () => {
    try {
      const req = apis?.textInference?.models
      if (!req) return

      const res = await req()
      if (!res) throw new Error('Failed to connect to Ai.')

      const json = await res?.json()
      const data = json?.data

      return data
    } catch (error) {
      console.log(`[homebrew] connectTextService: ${error}`)
      return
    }
  }, [apis])

  /**
   * Get all api configs for services.
   */
  const getServices = async () => {
    const res = await getAPIConfig()
    const serviceApis = createServices(res)
    setAPI(serviceApis)
    return res
  }

  return { connect, connectTextService, getServices, apis }
}
