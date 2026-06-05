import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { db } = await import("@/lib/db/client")
        const bcrypt = await import("bcryptjs")

        const user = await db.shopUser.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
          shopId: user.shopId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.shopId = (user as { shopId: string }).shopId
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as string
      session.user.shopId = token.shopId as string
      return session
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
})
