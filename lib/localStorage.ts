import { I_Session } from '@/lib/hooks/use-local-chat'

interface I_Connection {
  domain: string
  port: string
}

const CONNECTION_KEY = 'remote_host'
const IS_CONNECTED_KEY = 'has_connection'
const USER = 'user'

const clearUserDetails = () => {
  sessionStorage.removeItem(USER)
}

const setUserDetails = (data: I_Session) => {
  const setting = JSON.stringify(data)
  sessionStorage.setItem(USER, setting)
}

const getUserDetails = (): I_Session | never => {
  const data = sessionStorage.getItem(USER)
  const user = data ? JSON.parse(data) : null
  return user
}

const getHostConnection = (): I_Connection => {
  const data = localStorage.getItem(CONNECTION_KEY)
  const modelConfigs = data ? JSON.parse(data) : {}
  return modelConfigs
}

const setHostConnection = (newConnection: I_Connection) => {
  const setting = JSON.stringify(newConnection)
  localStorage.setItem(CONNECTION_KEY, setting)
}

const deleteHostConnectionFlag = () => {
  sessionStorage.removeItem(IS_CONNECTED_KEY)
}

const storage = {
  getHostConnection,
  setHostConnection,
  deleteHostConnectionFlag,
  setUserDetails,
  getUserDetails,
  clearUserDetails,
}

export default storage
