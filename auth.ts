import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Anonymous, { ANON } from '@/lib/auth/providers/anonymous'
// import Email from 'next-auth/providers/email'
// import Auth0 from 'next-auth/providers/auth0'
// import Facebook from 'next-auth/providers/facebook'
// import LinkedIn from 'next-auth/providers/linkedin'
// import Twitter from 'next-auth/providers/twitter'
// import Twitch from 'next-auth/providers/twitch'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental, // will be removed in future
} = NextAuth({
  providers: [Anonymous, GitHub, Google],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id
        token.image = profile.picture
      }
      return token
    },
    authorized({ auth }) {
      return !!auth?.user?.name // this ensures there is a logged in user for -every- request
    },
    async signIn({ profile, user, account, credentials }) {
      const isUserAllowed = profile?.login === 'dieharders' || account?.provider === ANON
      return isUserAllowed
    },
    async redirect({ url, baseUrl }) {
      // Where to go after successful sign-in (email, credentials only)
      return '/'
    },
  },
  // pages: {
  //   signIn: '/sign-in', // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  // },
  session: { strategy: 'jwt' },
})
