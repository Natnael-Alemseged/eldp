import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session
}

export async function requireShopAccess(shopId: string) {
  const session = await requireAuth()
  if (session.user.shopId !== shopId) throw new Error("Access denied: wrong shop")
  return session
}
