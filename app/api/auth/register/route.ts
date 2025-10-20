import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { hashPassword } from "@/lib/crypto"
import { createSession, logSecurityEvent } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, phoneNumber } = await request.json()

    // Validaciones
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUsers = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `

    if (existingUsers.length > 0) {
      await logSecurityEvent(
        null,
        "REGISTER_FAILED",
        "Usuario o email ya existe",
        false,
        { username, email },
        request.ip,
        request.headers.get("user-agent") || undefined,
      )
      return NextResponse.json({ error: "El usuario o email ya existe" }, { status: 409 })
    }

    // Crear usuario
    const passwordHash = await hashPassword(password)
    const users = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email, world_id_verified, wallet_address
    `

    const user = users[0]

    // Crear sesión
    await createSession(user.id, request.ip, request.headers.get("user-agent") || undefined)

    // Log de seguridad
    await logSecurityEvent(
      user.id,
      "USER_REGISTERED",
      "Usuario registrado exitosamente",
      true,
      { username, email },
      request.ip,
      request.headers.get("user-agent") || undefined,
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        world_id_verified: user.world_id_verified,
        wallet_address: user.wallet_address,
      },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
