import CredentialsProvider from 'next-auth/providers/credentials'
import { nanoid } from '@/lib/utils'

export const ANON = 'ANONYMOUS'

const Anon = CredentialsProvider({
  id: ANON,
  type: 'credentials',
  // The name to display on the sign in form (e.g. "Sign in with...")
  name: 'Anonymous',
  // `credentials` is used to generate a form on the sign in page.
  // You can specify which fields should be submitted, by adding keys to the `credentials` object.
  // e.g. domain, username, password, 2FA token, etc.
  // You can pass any HTML attribute to the <input> tag through the object.
  credentials: {
    username: { label: 'Username', type: 'text', placeholder: 'Sam Altman' },
    // password: { label: 'Password', type: 'password' },
  },
  authorize: async credentials => {
    const id = nanoid()
    const name = `${credentials?.username || 'anonymous'}`
    return { id, name, email: `${name}@email.com`, type: ANON }
  },
})

export default Anon
