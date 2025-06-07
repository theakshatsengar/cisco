import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name?.split(' ')[0] // Get first name only
      }
      return session
    },
  },
})

export { handler as GET, handler as POST } 