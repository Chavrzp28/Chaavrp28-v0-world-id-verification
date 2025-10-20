import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { verifyPassword } from "@/lib/crypto"
import { createSession, logSecurityEvent } from "@/lib/auth"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutos

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const users = await sql`
      SELECT id, username, email, password_hash, world_id_verified, wallet_address, 
             two_factor_enabled, failed_login_attempts, account_locked_until
      FROM users
      WHERE username = ${username} OR email = ${username}
    `

    if (users.length === 0) {
      await logSecurityEvent(
        null,
        "LOGIN_FAILED",
        "Usuario no encontrado",
        false,
        { username },
        request.ip,
        request.headers.get("user-agent") || undefined,
      )
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 })
    }

    const user = users[0]

    // Verificar si la cuenta está bloqueada
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      return NextResponse.json({ error: "Cuenta bloqueada temporalmente. Intenta más tarde." }, { status: 423 })
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      // Incrementar intentos fallidos
      const failedAttempts = user.failed_login_attempts + 1
      const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS

      await sql`
        UPDATE users
        SET failed_login_attempts = ${failedAttempts},
            account_locked_until = ${shouldLock ? new Date(Date.now() + LOCKOUT_DURATION) : null}
        WHERE id = ${user.id}
      `

      await logSecurityEvent(
        user.id,
        "LOGIN_FAILED",
        "Contraseña incorrecta",
        false,
        { failedAttempts },
        request.ip,
        request.headers.get("user-agent") || undefined,
      )

      return NextResponse.json(
        {
          error: shouldLock
            ? "Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos."
            : "Usuario o contraseña incorrectos",
          attemptsRemaining: shouldLock ? 0 : MAX_FAILED_ATTEMPTS - failedAttempts,
        },
        { status: 401 },
      )
    }

    // Login exitoso - resetear intentos fallidos
    await sql`
      UPDATE users
      SET failed_login_attempts = 0,
          account_locked_until = NULL,
          last_login = NOW()
      WHERE id = ${user.id}
    `

    // Si tiene 2FA habilitado, requerir código
    if (user.two_factor_enabled) {
      await logSecurityEvent(
        user.id,
        "LOGIN_2FA_REQUIRED",
        "Login exitoso, requiere 2FA",
        true,
        {},
        request.ip,
        request.headers.get("user-agent") || undefined,
      )

      return NextResponse.json({
        success: true,
        requires2FA: true,
        userId: user.id,
      })
    }

    // Crear sesión
    await createSession(user.id, request.ip, request.headers.get("user-agent") || undefined)

    await logSecurityEvent(
      user.id,
      "LOGIN_SUCCESS",
      "Login exitoso",
      true,
      {},
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
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
