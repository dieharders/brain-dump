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

export type T_GenericDataRes = any

// @TODO Remove the extends once text inference is rolled into our own response schema
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

export type T_TextModelsData = {
  id: string
  name: string
  path: string // path to model on disk
  size: string
  type?: string // what type it is
  ownedBy: string
  permissions: string[]
  promptTemplate: string
  systemPrompt: string
  n_ctx: number
}

type T_PromptTemplate = {
  id: string
  name: string
  text: string
}

export type T_RAGPromptTemplate = {
  id: string
  name: string
  text: string
  type: string
}

export type T_SystemPrompt = {
  id: string
  name: string
  text: string
}

export type T_PromptTemplates = {
  rag_presets: { [key: string]: T_RAGPromptTemplate[] }
  normal_presets: { [key: string]: T_PromptTemplate[] }
}

export type T_SystemPrompts = {
  presets: { [key: string]: T_SystemPrompt[] }
}

export interface I_ServiceApis {
  /**
   * Use to query the text inference engine
   */
  textInference: {
    // Homebrew version
    inference: T_GenericAPIRequest<T_GenericDataRes>
    load: T_GenericAPIRequest<T_GenericDataRes>
    model: T_GenericAPIRequest<T_TextModelsData>
    installed: T_GenericAPIRequest<T_GenericDataRes>
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
  /**
   * Use to persist data
   */
  storage: {
    getSettings: T_GenericAPIRequest<T_GenericDataRes>
    saveSettings: T_GenericAPIRequest<T_GenericDataRes>
    // getModelConfigs: T_GenericAPIRequest<T_GenericDataRes>
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
    let res: Response

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
          res = await fetch(url, {
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

          // Check json response
          const responseType = res.headers.get('content-type')
          if (res.json && !responseType?.includes('event-stream')) {
            const result = await res.json()

            if (!result) throw new Error('Something went wrong')
            // Check error from homebrew api
            if (typeof result?.error === 'boolean' && result?.error) {
              const error = new Error(`${result?.error}`) as Error & {
                status: number
              }
              error.status = res.status
              throw error
            }
            // Check failure from homebrew api
            if (typeof result?.success === 'boolean' && !result?.success)
              throw new Error(
                `${endpoint.name} An unexpected error occurred: ${
                  result?.message ?? result?.detail
                }`,
              )
            // Success
            return result
          }

          // Return raw response from llama-cpp-python server text inference
          return res
        } catch (err) {
          console.log(`[homebrew] Endpoint ${endpoint.name} error:`, err)
          return { success: false, message: err }
        }
      }

      // Add request function for this endpoint
      endpoints[endpoint.name] = request
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
   * Get all api configs for services.
   */
  const getServices = async () => {
    const res = await getAPIConfig()
    const serviceApis = createServices(res)
    return serviceApis
  }

  return { connect, getServices }
}
