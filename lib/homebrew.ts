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

export type T_GenericDataRes = any

export interface I_GenericAPIResponse<DataResType> extends Response {
  success: boolean
  message: string
  data: DataResType
}

export interface I_GenericAPIRequestParams {
  queryParams?: { [key: string]: any }
  formData?: FormData
  body?: { [key: string]: any }
}

// Pass in the type of response.data we expect
export type T_GenericAPIRequest<DataResType> = (
  props?: I_GenericAPIRequestParams,
) => Promise<I_GenericAPIResponse<DataResType> | null>

// These are the sources (documents) kept track by a collection
export interface I_DocSource {
  id: string // Globally unique id
  name: string // Source id
  filePath: string // Update sources paths (where original uploaded files are stored)
  urlPath: string
  description: string
  tags: string
  createdAt: string
  checksum: string
}

export interface I_Document {
  ids: string
  documents: string
  embeddings: number[]
  metadata: I_DocSource
}

export interface I_Collection {
  id: string
  name: string
  metadata: {
    sources: string[]
    description: string
    tags: string
    createdAt?: string
    sharePath?: string
    favorites?: number
  }
}

export interface I_GetCollectionData {
  collection: I_Collection
  numItems: number
}

export interface I_ServiceApis {
  /**
   * Use to query the text inference engine
   */
  textInference: {
    completions: T_GenericAPIRequest<T_GenericDataRes>
    embeddings: T_GenericAPIRequest<T_GenericDataRes>
    chatCompletions: T_GenericAPIRequest<T_GenericDataRes>
    models: T_GenericAPIRequest<T_GenericDataRes>
  }
  /**
   * Use to add/create/update/delete embeddings from database
   */
  memory: {
    addDocument: T_GenericAPIRequest<T_GenericDataRes>
    getDocument: T_GenericAPIRequest<T_GenericDataRes>
    updateDocument: T_GenericAPIRequest<T_GenericDataRes>
    deleteDocuments: T_GenericAPIRequest<T_GenericDataRes>
    getAllCollections: T_GenericAPIRequest<T_GenericDataRes>
    addCollection: T_GenericAPIRequest<T_GenericDataRes>
    getCollection: T_GenericAPIRequest<I_GetCollectionData>
    deleteCollection: T_GenericAPIRequest<T_GenericDataRes>
    fileExplore: T_GenericAPIRequest<T_GenericDataRes>
    wipe: T_GenericAPIRequest<T_GenericDataRes>
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
      // Create a re-usable fetch function
      const request = async (args: I_GenericAPIRequestParams) => {
        try {
          const contentType = { 'Content-Type': 'application/json' }
          const method = endpoint.method
          const headers = { ...(method === 'POST' && !args?.formData && contentType) }
          const body = args?.formData ? args.formData : JSON.stringify(args?.body)
          const queryParams = args?.queryParams
            ? new URLSearchParams(args?.queryParams).toString()
            : null
          const queryUrl = queryParams ? `?${queryParams}` : ''
          const url = `${origin}${endpoint.urlPath}${queryUrl}`
          const res = await fetch(url, {
            method,
            mode: 'cors', // no-cors, *, cors, same-origin
            cache: 'no-cache',
            credentials: 'same-origin',
            headers, // { 'Content-Type': 'multipart/form-data' }, // Browser will set this automatically for us for "formData"
            redirect: 'follow',
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body,
          })
          // Check no response
          if (!res) throw new Error(`No response for endpoint ${endpoint.name}.`)
          // Check errored response
          if (res.json) {
            const result = await res.json()
            if (result?.error) {
              const error = new Error(`${result?.error}`) as Error & {
                status: number
              }
              error.status = res.status
              throw error
            }
            if (!result?.success)
              throw new Error(
                `${endpoint.name} An unexpected error occurred: ${
                  result?.message ?? result?.detail
                }`,
              )
            return result
          }
          // Check success
          if (res.ok) return res
          throw new Error('Something went wrong')
        } catch (err) {
          console.log(`[homebrew] Endpoint ${endpoint.name} error:`, err)
          return { success: false, message: err }
        }
      }

      // Add request function
      const reqFunction = async (args: I_GenericAPIRequestParams) => {
        // This is specific to constructing prompts, only applies to "completions"
        const prompt = args?.body?.prompt
          ? endpoint?.promptTemplate?.replace('{{PROMPT}}', args.body.prompt)
          : ''
        const newArgs = prompt
          ? { body: { ...args.body, prompt }, queryParams: args?.queryParams }
          : args

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
  const connectTextService = async () => {
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
  }

  /**
   * Get all api configs for services.
   */
  const getServices = async () => {
    const res = await getAPIConfig()
    const serviceApis = createServices(res)
    return serviceApis
  }

  return { connect, connectTextService, getServices }
}
