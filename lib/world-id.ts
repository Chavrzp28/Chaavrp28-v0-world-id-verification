import type { VerificationLevel } from "@worldcoin/idkit-core"

export interface WorldIDVerification {
  proof: string
  merkle_root: string
  nullifier_hash: string
  verification_level: VerificationLevel
}

export async function verifyWorldID(
  proof: string,
  merkle_root: string,
  nullifier_hash: string,
  signal: string,
): Promise<boolean> {
  try {
    const response = await fetch("https://developer.worldcoin.org/api/v1/verify/app_staging_c8f0e5e5e5e5e5e5e5e5e5e5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        proof,
        merkle_root,
        nullifier_hash,
        signal,
        action: "verify-identity",
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error("[v0] World ID verification error:", error)
    return false
  }
}
