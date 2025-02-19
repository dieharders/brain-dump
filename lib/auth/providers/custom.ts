import { I_Session } from '@/lib/hooks/use-local-chat'
import { nanoid } from '@/lib/utils'

export const CUSTOM = 'CUSTOM'

export const Custom = () => ({
  authorize: async (credentials: { username: string }): Promise<I_Session> => {
    const id = nanoid()
    const name = `${credentials?.username || 'anonymous'}`
    return {
      user: { id, name, email: `${name}@email.com`, exp: 0, iat: 0, jti: '', sub: '' },
      expires: '',
    }
  },
})
