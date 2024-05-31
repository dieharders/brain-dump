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
  providers: [
    Anonymous,
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
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
      // @TODO Configure this to check provider accounts
      const isUserAllowed =
        account?.provider === ANON ||
        account?.provider === 'github' ||
        account?.provider === 'google'
      return isUserAllowed

      // Or you can return a URL to redirect to:
      // return '/unauthorized'
    },
    async redirect({ url, baseUrl }) {
      // Where to go after successful sign-in (email, credentials only)
      return baseUrl
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub || ''
      }
      // session.type = ANON
      return session
    },
  },
  pages: {
    signIn: '/auth/sign-in', // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
  },
  session: { strategy: 'jwt' },
})
