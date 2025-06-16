import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
        session.user.picture = token.picture
        session.user.given_name = token.given_name
        session.user.family_name = token.family_name
        session.user.locale = token.locale
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (profile) {
        token.given_name = profile.given_name
        token.family_name = profile.family_name
        token.locale = profile.locale
      }
      return token
    }
  },
})

export { handler as GET, handler as POST } 