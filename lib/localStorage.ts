interface I_Connection {
  domain: string
  port: string
}

const CONNECTION_KEY = 'remote_host'
const IS_CONNECTED_KEY = 'has_connection'
const API_CONFIG_KEY = 'api_config'
const SERVICES_KEY = 'services'

const getHostConnection = (): I_Connection => {
  const data = localStorage.getItem(CONNECTION_KEY)
  const modelConfigs = data ? JSON.parse(data) : {}
  return modelConfigs
}

const setHostConnection = (newConnection: I_Connection) => {
  const setting = JSON.stringify(newConnection)
  localStorage.setItem(CONNECTION_KEY, setting)
}

/**
 * Have we already connected to this host during this session?
 */
const getHostConnectionFlag = () => {
  const data = sessionStorage.getItem(IS_CONNECTED_KEY)
  const hasConn = data ? JSON.parse(data) : false
  return hasConn
}

const setHostConnectionFlag = (flag: boolean) => {
  const setting = JSON.stringify(flag)
  sessionStorage.setItem(IS_CONNECTED_KEY, setting)
}

const deleteHostConnectionFlag = () => {
  sessionStorage.removeItem(IS_CONNECTED_KEY)
}

const getApiConfigs = () => {
  const apis = sessionStorage.getItem(API_CONFIG_KEY)
  const result = apis ? JSON.parse(apis) : {}
  return result
}

const setApiConfigs = (data: any) => {
  const setting = JSON.stringify(data)
  sessionStorage.setItem(API_CONFIG_KEY, setting)
}

const getServices = () => {
  const services = sessionStorage.getItem(SERVICES_KEY)
  const result = services ? JSON.parse(services) : []
  return result
}

const setServices = (data: any) => {
  const setting = JSON.stringify(data)
  sessionStorage.setItem(SERVICES_KEY, setting)
}

const storage = {
  getHostConnection,
  setHostConnection,
  getHostConnectionFlag,
  setHostConnectionFlag,
  deleteHostConnectionFlag,
  getApiConfigs,
  setApiConfigs,
  getServices,
  setServices,
}

export default storage
