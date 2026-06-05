import { db } from "@/lib/db/client"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  shopName: z.string().min(2),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { shopName, adminName, adminEmail, adminPassword } = parsed.data

  const existing = await db.shopUser.findUnique({ where: { email: adminEmail } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hash = await bcrypt.hash(adminPassword, 12)
  const shop = await db.shop.create({
    data: {
      name: shopName,
      users: {
        create: { email: adminEmail, password: hash, name: adminName, role: "SHOP_ADMIN" },
      },
    },
  })

  return NextResponse.json({ shopId: shop.id }, { status: 201 })
}
