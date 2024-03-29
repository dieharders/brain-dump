import { useCallback, useMemo } from 'react'
import { type Message } from 'ai/react'

export enum ModelID {
  GPT3 = 'gpt3.5',
  GPT4 = 'gpt4',
  GPTNeo = 'gpt-neoxt-20B', // together/
  Cohere = 'xlarge', // cohere/
  Local = 'local', // 3rd party, local server
}

export interface I_LLM_Init_Options {
  n_gpu_layers?: number
  use_mlock?: boolean
  seed?: number
  n_ctx?: number
  n_batch?: number
  n_threads?: number
  offload_kqv?: boolean
  chat_format?: string // 'llama2' @TODO check backend if we use this
  f16_kv?: boolean
  verbose?: boolean
}

export interface I_LLM_Call_Options extends I_Response_State {
  prompt?: string
  messages?: Message[]
  suffix?: string
  model?: ModelID
  promptTemplate?: string
  systemMessage?: string
  ragPromptTemplate?: T_RAGPromptTemplate
  similarity_top_k?: number
  response_mode?: string
}

export interface I_LLM_Options {
  init?: I_LLM_Init_Options
  call?: I_LLM_Call_Options
}

export type T_APIConfigOptions = {
  chunkingStrategies?: Array<string>
  ragResponseModes?: Array<string>
  domain?: string
  port?: string
}

export interface I_InferenceGenerateOptions extends T_LLM_InferenceOptions {
  mode?: T_ConversationMode
  messageFormat?: string
  collectionNames?: string[]
}

type T_LLM_InferenceOptions = I_LLM_Call_Options & I_LLM_Init_Options

type T_APIRequests = {
  services: I_ServiceApis
  configs: T_APIConfigOptions
}

type T_ClientAPI = {
  hasServerConnection?: boolean
  api?: T_APIRequests
}

declare global {
  interface Window {
    homebrewai?: T_ClientAPI
  }
}

interface I_Endpoint {
  name: string
  urlPath: string
  method: string
}

interface I_API {
  name: string
  port: number
  endpoints: Array<I_Endpoint>
  configs?: T_APIConfigOptions
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

export const DEFAULT_CONVERSATION_MODE = 'instruct'

export type T_ConversationMode = 'instruct' | 'chat' | 'sliding'

export type T_GenericDataRes = any
export type T_GenericReqPayload = { [key: string]: any }

export interface I_GenericAPIResponse<DataResType> {
  success: boolean
  message: string
  data: DataResType
}

// Use 'body' for POST requests with complex (arrays) data types
// Use 'queryParams' for POST requests with simple data structs and forms
// Use 'formData' for POST requests with complex forms (binary uploads)
export interface I_GenericAPIRequestParams<Payload> {
  queryParams?: Payload
  formData?: FormData
  body?: Payload
}

// Pass in the type of response.data we expect
export type T_GenericAPIRequest<ReqPayload, DataResType> = (
  props?: I_GenericAPIRequestParams<ReqPayload>,
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

export type T_ModelConfig = {
  repoId: string
  name: string
  description?: string
  messageFormat?: string
  // used for model init
  context_window?: number
  num_gpu_layers?: number
}

export interface I_ModelConfigs {
  [key: string]: T_ModelConfig
}

export type T_InstalledTextModel = {
  repoId: string
  savePath: { [key: string]: string }
  numTimesRun: number
  isFavorited: boolean
  validation: string
  modified: string
  size: number
  endChunk: number
  progress: number
  tokenizerPath: string
  checksum: string
}

export type T_PromptTemplate = {
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

export interface I_RAGPromptTemplates {
  [key: string]: T_RAGPromptTemplate[]
}

export type T_SystemPrompt = {
  id: string
  name: string
  text: string
}

export interface I_PromptTemplates {
  [key: string]: T_PromptTemplate[]
}

export type T_PromptTemplates = {
  rag_presets: I_RAGPromptTemplates
  normal_presets: I_PromptTemplates
}

export type T_SystemPrompts = {
  presets: { [key: string]: T_SystemPrompt[] }
}

export interface I_LoadTextModelRequestPayload {
  mode?: T_ConversationMode
  modelPath: string
  modelId: string
  init: I_LLM_Init_Options
  call: I_LLM_Call_Options
}

export interface I_Response_State {
  temperature?: number
  max_tokens?: number
  top_p?: number
  echo?: boolean
  stop?: string[]
  repeat_penalty?: number
  top_k?: number
  stream?: boolean
  min_p?: number
  presence_penalty?: number // 1.0
  frequency_penalty?: number // 1.0
  tfs_z?: number
  mirostat_tau?: number
  grammar?: string
}

export type T_Memory_Type = 'training' | 'augmented_retrieval'

export interface I_Knowledge_State {
  type: T_Memory_Type
  index: string[]
}

export interface I_RAG_Strat_State {
  similarity_top_k: number
  response_mode: string | undefined
}

export type I_Prompt_State = {
  promptTemplate: T_PromptTemplate
  ragTemplate: T_RAGPromptTemplate
  ragMode: I_RAG_Strat_State
}

export interface I_Model_State {
  id: string | undefined // @TODO change to modelId
  botName: string
  filename: string
}

export interface I_System_State {
  systemMessage: string | undefined
  systemMessageName: string | undefined
}

export interface I_Attention_State {
  mode: T_ConversationMode
}

export interface I_Text_Settings {
  attention: I_Attention_State
  performance: I_LLM_Init_Options
  system: I_System_State
  model: I_Model_State
  prompt: I_Prompt_State
  knowledge: I_Knowledge_State
  response: I_Response_State
}

type T_Endpoint = { [key: string]: any }

interface I_BaseServiceApis {
  [key: string]: T_Endpoint
}

type T_TextInferenceAPIRequest = (props: {
  body: I_InferenceGenerateOptions
}) => (Response & I_GenericAPIResponse<any>) | null

interface I_DeleteTextModelReqPayload {
  repoId: string
  filename: string
}

export interface I_LoadedModelRes {
  modelId: string
  mode: T_ConversationMode
  modelSettings: I_LLM_Init_Options
  generateSettings: I_LLM_Call_Options
}

export interface I_ServiceApis extends I_BaseServiceApis {
  /**
   * Use to query the text inference engine
   */
  textInference: {
    inference: T_TextInferenceAPIRequest
    load: T_GenericAPIRequest<
      I_LoadTextModelRequestPayload,
      I_GenericAPIResponse<undefined>
    >
    unload: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    model: T_GenericAPIRequest<T_GenericReqPayload, I_LoadedModelRes> // Currently loaded text model
    modelExplore: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    installed: T_GenericAPIRequest<T_GenericReqPayload, T_InstalledTextModel[]> // List of currently installed text models
    getModelMetadata: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getModelInfo: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    download: T_GenericAPIRequest<T_GenericReqPayload, string>
    delete: T_GenericAPIRequest<I_DeleteTextModelReqPayload, T_GenericDataRes>
    getModelConfigs: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getPromptTemplates: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getRagPromptTemplates: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getSystemPrompts: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
  }
  /**
   * Use to add/create/update/delete embeddings from database
   */
  memory: {
    addDocument: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getDocument: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    updateDocument: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    deleteDocuments: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getAllCollections: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    addCollection: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    getCollection: T_GenericAPIRequest<T_GenericReqPayload, I_GetCollectionData>
    deleteCollection: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    fileExplore: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
    wipe: T_GenericAPIRequest<T_GenericReqPayload, T_GenericDataRes>
  }
  /**
   * Use to persist data
   */
  storage: {
    getPlaygroundSettings: T_GenericAPIRequest<T_GenericReqPayload, I_Text_Settings>
    savePlaygroundSettings: T_GenericAPIRequest<T_GenericReqPayload, I_Text_Settings>
    getBotSettings: T_GenericAPIRequest<T_GenericReqPayload, I_Text_Settings[]>
    saveBotSettings: T_GenericAPIRequest<T_GenericReqPayload, I_Text_Settings[]>
  }
}

export const defaultPort = '8008'
export const defaultDomain = 'http://localhost'
const createDomainName = () => {
  const PORT = window?.homebrewai?.api?.configs?.port || defaultPort
  const DOMAIN = window?.homebrewai?.api?.configs?.domain || defaultDomain
  const origin = `${DOMAIN}:${PORT}`
  return origin
}

const fetchConnect = async (): Promise<I_ConnectResponse | null> => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  try {
    const domain = createDomainName()
    const res = await fetch(`${domain}/v1/connect`, options)
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
    // @TODO Remove the use of fetching configs. Just use connect() and have it return everything fetchAPIConfig does.
    const endpoint = '/v1/services/api'
    const domain = createDomainName()
    const res = await fetch(`${domain}${endpoint}`, options)
    if (!res.ok) throw new Error(`[homebrew] HTTP error! Status: ${res.status}`)
    if (!res) throw new Error(`[homebrew] No response from ${endpoint}`)
    return res.json()
  } catch (err) {
    console.log('[homebrew] fetchAPIConfig error:', err)
    return null
  }
}

const getModelConfigs = async () => {
  // Read in json file
  const file = await import('../data/text-model-configs.json')

  return {
    success: true,
    message: 'Returned configurations for all curated models.',
    data: file.default,
  }
}

const getPromptTemplates = async () => {
  // Read in json file
  const file = await import('../data/prompt-templates.json')

  return {
    success: true,
    message: 'Returned all prompt templates for text inference.',
    data: file.default,
  }
}

const getRagPromptTemplates = async () => {
  // Read in json file
  const file = await import('../data/rag-prompt-templates.json')

  return {
    success: true,
    message: 'Returned retrieval augmented generation templates for text inference.',
    data: file.default,
  }
}

const getSystemPrompts = async () => {
  // Read in json file
  const file = await import('../data/system-prompts.json')

  return {
    success: true,
    message: 'Returned all system prompts for text inference.',
    data: file?.default,
  }
}

// Builds services and their methods for use by front-end
const createServices = (response: I_API[] | null): I_ServiceApis | null => {
  if (!response || response.length === 0) return null

  const serviceApis = {} as I_ServiceApis

  // Construct api funcs for each service
  response.forEach(api => {
    const origin = `${createDomainName()}`
    const apiName = api.name
    const endpoints: { [key: string]: (args: any) => Promise<Response | null> } = {}
    let res: Response

    // Parse endpoint urls
    api.endpoints.forEach(endpoint => {
      // Create a re-usable fetch function
      const request = async (args: I_GenericAPIRequestParams<T_GenericReqPayload>) => {
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

  // Inject non-backend related methods
  serviceApis.textInference.getModelConfigs = getModelConfigs
  serviceApis.textInference.getPromptTemplates = getPromptTemplates
  serviceApis.textInference.getRagPromptTemplates = getRagPromptTemplates
  serviceApis.textInference.getSystemPrompts = getSystemPrompts

  return serviceApis
}

const connectToLocalProvider = async (): Promise<I_ConnectResponse | null> => {
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
  // Init global context
  let store = useMemo(() => ({} as T_ClientAPI), [])

  if (typeof window !== 'undefined') {
    // Client-side-only code
    if (!window.homebrewai) window.homebrewai = {}
    store = window.homebrewai
  }

  /**
   * Get all api configs for services.
   */
  const getServices = useCallback(async () => {
    if (store.api?.services) return store.api?.services

    const res = await getAPIConfig()
    // Store all config options for endpoints
    let configOptions: T_APIConfigOptions = {}
    res?.forEach(i => {
      if (i.configs) configOptions = { ...configOptions, ...i.configs }
    })
    // Return readily usable request funcs
    const serviceApis = createServices(res)
    if (store && serviceApis && configOptions) {
      const d = { configs: configOptions, services: serviceApis }
      if (!store?.api) store.api = d
      store.api = d
    }
    return serviceApis
  }, [store])

  /**
   * Attempt to connect to homebrew api.
   */
  const connect = useCallback(async () => {
    const result = await connectToLocalProvider()
    if (!result?.success) return null

    // Track the initial attempt at a connection
    if (store) store.hasServerConnection = true

    // Attempt to return api services
    await getServices()

    return result
  }, [getServices, store])

  /**
   * Return options for all endpoints
   */
  const getAPIConfigOptions = async () => {
    if (!store?.api) {
      await getServices()
      return store?.api?.configs
    }
    return store?.api?.configs
  }

  /**
   * Store remote address values for later api calls
   */
  const saveRemoteAddress = ({
    portValue,
    domainValue,
  }: {
    portValue: string
    domainValue: string
  }) => {
    const configs = {
      configs: {
        port: portValue,
        domain: domainValue,
      },
    } as T_APIRequests

    if (!window.homebrewai?.api) window.homebrewai = { api: configs }
    else {
      window.homebrewai.api.configs.port = portValue
      window.homebrewai.api.configs.domain = domainValue
    }
  }

  return { connect, getServices, getAPIConfigOptions, saveRemoteAddress }
}
