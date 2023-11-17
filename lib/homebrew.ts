import { useCallback, useEffect, useState } from 'react'

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

type T_EndpointStruct = {
  name: string
  urlPath: string
  method: string
}
type T_APIStruct = {
  name: string
  port: number
  endpoints: T_EndpointStruct[]
}
type T_DataStruct = { [api_key: string]: T_APIStruct }
interface I_GenericAPIResponse extends Response {
  success: boolean
  message: string
  data: T_DataStruct[]
}

type T_GenericAPIRequest = (props?: any) => Promise<I_GenericAPIResponse | null>

export interface I_ServiceApis {
  textInference: {
    completions: T_GenericAPIRequest
    embeddings: T_GenericAPIRequest
    chatCompletions: T_GenericAPIRequest
    models: T_GenericAPIRequest
  }
  memory: {
    create: T_GenericAPIRequest
    addCollection: T_GenericAPIRequest
    getAllCollections: T_GenericAPIRequest
    getCollection: T_GenericAPIRequest
    getDocument: T_GenericAPIRequest
  }
}

// @TODO These will eventually be passed in from our server picker helper
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
    // @TODO This api url should come from the /connect endpoint
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
  if (!response || response.length === 0) return null

  const serviceApis: any = {}
  response.forEach(api => {
    const origin = `${hostname}${api.port}`
    const apiName = api.name
    const endpoints: { [key: string]: (args: any) => Promise<Response | null> } = {}
    // Parse endpoint urls
    api.endpoints.forEach(endpoint => {
      const method = endpoint.method

      const contentType = { 'Content-Type': 'application/json' }
      const headers = { ...(method === 'POST' && contentType) }
      const request = async (args: any) => {
        try {
          // Normal fetch
          const queryParams = args?.queryParams
            ? new URLSearchParams(args?.queryParams).toString()
            : null
          const queryUrl = queryParams ? `?${queryParams}` : ''
          const url = `${origin}${endpoint.urlPath}${queryUrl}` // If method=GET then add args as query params to end of url
          const body = { body: JSON.stringify(args) }
          const res = await fetch(url, {
            method,
            mode: 'cors', // no-cors, *, cors, same-origin
            cache: 'no-cache',
            credentials: 'same-origin',
            headers,
            redirect: 'follow',
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            ...(method === 'POST' && body),
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
    // Track the initial attempt at a connection
    if (window?.homebrewai) window.homebrewai.hasInitConnection = true

    const result = await connectToLocalProvider()
    if (!result?.success) return null

    // Attempt to return api services
    await getServices()

    return result
  }

  /**
   * Attempt to connect to text inference server.
   */
  const connectTextService = useCallback(async () => {
    try {
      // Return api services
      const servicesResponse = await getServices()

      const req = servicesResponse?.textInference?.models
      if (!req) return

      const res = await req()
      if (!res) throw new Error('Failed to connect to Ai.')
      const data = res?.data

      return data
    } catch (error) {
      console.log(`[homebrew] connectTextService: ${error}`)
      return
    }
  }, [])

  /**
   * Get all api configs for services.
   */
  const getServices = async () => {
    const res = await getAPIConfig()
    const serviceApis = createServices(res)
    setAPI(serviceApis)
    return serviceApis
  }

  // Make sure homebrewai object exists
  useEffect(() => {
    if (!window?.homebrewai) window.homebrewai = {}
  }, [])

  return { connect, connectTextService, getServices, apis }
}
