import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: session.user,
    })
  } catch (error) {
    console.error("[v0] Session check error:", error)
    return NextResponse.json({ error: "Error al verificar sesión" }, { status: 500 })
  }
}
