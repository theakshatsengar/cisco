import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      given_name?: string | null
      family_name?: string | null
      locale?: string | null
    }
  }
}

// Extend the built-in JWT types
declare module "next-auth/jwt" {
  interface JWT {
    given_name?: string
    family_name?: string
    locale?: string
  }
}

interface GoogleProfile {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: boolean
  name: string
  picture: string
  given_name: string
  family_name: string
  locale: string
  iat: number
  exp: number
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
        }
      }
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name?.split(' ')[0] // Get first name only
        session.user.email = token.email
        session.user.image = token.picture
        session.user.given_name = token.given_name
        session.user.family_name = token.family_name
        session.user.locale = token.locale
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (profile) {
        const googleProfile = profile as GoogleProfile
        token.given_name = googleProfile.given_name
        token.family_name = googleProfile.family_name
        token.locale = googleProfile.locale
      }
      return token
    }
  },
})

export { handler as GET, handler as POST } 