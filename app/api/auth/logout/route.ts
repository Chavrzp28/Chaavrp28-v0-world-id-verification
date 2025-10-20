import { NextResponse } from "next/server"
import { destroySession, getSession, logSecurityEvent } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getSession()

    if (session) {
      await logSecurityEvent(session.user.id, "LOGOUT", "Usuario cerró sesión", true)
    }

    await destroySession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}
