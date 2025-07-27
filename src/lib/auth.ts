import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user || !user.password) return null
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isPasswordCorrect) return null
        return user
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {

      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      token.picture = user?.image || token.picture || null
      token = { ...token, user }

      return token
    },
    async session({ session, token }) {


      if (token && session.user) {
        session = { ...session, user: { ...session.user, image: token.picture }, profile: { ...token } }

      }
      console.log("Session callback:", session)
      return session
    },
  },
}
