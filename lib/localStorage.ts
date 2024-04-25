interface I_Connection {
  domain: string
  port: string
}

const CONNECTION_KEY = 'remote_host'
const IS_CONNECTED_KEY = 'has_connection'

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

const storage = {
  getHostConnection,
  setHostConnection,
  getHostConnectionFlag,
  setHostConnectionFlag,
  deleteHostConnectionFlag,
}

export default storage
