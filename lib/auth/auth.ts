import storage from '@/lib/localStorage'

const auth = () => {
  return storage.getUserDetails()
}

export default auth
