import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { getSession, logSecurityEvent } from "@/lib/auth"
import { verifyWorldID } from "@/lib/world-id"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { proof, merkle_root, nullifier_hash, signal } = await request.json()

    // Verificar que el nullifier_hash no haya sido usado
    const existingVerification = await sql`
      SELECT id FROM users WHERE world_id_nullifier_hash = ${nullifier_hash}
    `

    if (existingVerification.length > 0 && existingVerification[0].id !== session.user.id) {
      await logSecurityEvent(
        session.user.id,
        "WORLD_ID_VERIFICATION_FAILED",
        "Nullifier hash ya usado",
        false,
        { nullifier_hash },
        request.ip,
        request.headers.get("user-agent") || undefined,
      )
      return NextResponse.json({ error: "Esta verificación ya ha sido utilizada" }, { status: 409 })
    }

    // Verificar con World ID
    const isValid = await verifyWorldID(proof, merkle_root, nullifier_hash, signal)

    if (!isValid) {
      await logSecurityEvent(
        session.user.id,
        "WORLD_ID_VERIFICATION_FAILED",
        "Verificación de World ID inválida",
        false,
        { nullifier_hash },
        request.ip,
        request.headers.get("user-agent") || undefined,
      )
      return NextResponse.json({ error: "Verificación de World ID inválida" }, { status: 400 })
    }

    // Actualizar usuario con verificación
    await sql`
      UPDATE users
      SET world_id_verified = TRUE,
          world_id_nullifier_hash = ${nullifier_hash},
          world_id_merkle_root = ${merkle_root},
          world_id_proof = ${proof}
      WHERE id = ${session.user.id}
    `

    await logSecurityEvent(
      session.user.id,
      "WORLD_ID_VERIFIED",
      "Usuario verificado con World ID",
      true,
      { nullifier_hash },
      request.ip,
      request.headers.get("user-agent") || undefined,
    )

    return NextResponse.json({
      success: true,
      message: "Verificación exitosa con World ID",
    })
  } catch (error) {
    console.error("[v0] World ID verification error:", error)
    return NextResponse.json({ error: "Error al verificar World ID" }, { status: 500 })
  }
}
