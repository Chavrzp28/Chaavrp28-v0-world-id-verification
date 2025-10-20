import { cookies } from "next/headers"
import sql from "./db"
import { generateSecureToken } from "./crypto"

export interface User {
  id: string
  username: string
  email: string
  world_id_verified: boolean
  wallet_address: string | null
  two_factor_enabled: boolean
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const sessionToken = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

  await sql`
    INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at)
    VALUES (${userId}, ${sessionToken}, ${ipAddress}, ${userAgent}, ${expiresAt})
  `

  const cookieStore = await cookies()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionToken
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const sessions = await sql`
    SELECT s.*, u.id, u.username, u.email, u.world_id_verified, u.wallet_address, u.two_factor_enabled
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_token = ${sessionToken}
      AND s.expires_at > NOW()
  `

  if (sessions.length === 0) {
    return null
  }

  // Actualizar última actividad
  await sql`
    UPDATE sessions
    SET last_activity = NOW()
    WHERE session_token = ${sessionToken}
  `

  const session = sessions[0]
  return {
    sessionId: session.id,
    user: {
      id: session.user_id,
      username: session.username,
      email: session.email,
      world_id_verified: session.world_id_verified,
      wallet_address: session.wallet_address,
      two_factor_enabled: session.two_factor_enabled,
    } as User,
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (sessionToken) {
    await sql`
      DELETE FROM sessions
      WHERE session_token = ${sessionToken}
    `
  }

  cookieStore.delete("session_token")
}

export async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  eventDescription: string,
  success = true,
  metadata?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  await sql`
    INSERT INTO security_logs (user_id, event_type, event_description, success, metadata, ip_address, user_agent)
    VALUES (${userId}, ${eventType}, ${eventDescription}, ${success}, ${JSON.stringify(metadata)}, ${ipAddress}, ${userAgent})
  `
}
