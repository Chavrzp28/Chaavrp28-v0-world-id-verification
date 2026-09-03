import crypto from "node:crypto"

const rawEncryptionKey = process.env.ENCRYPTION_KEY

if (!rawEncryptionKey || !/^[0-9a-fA-F]{64}$/.test(rawEncryptionKey)) {
  throw new Error("ENCRYPTION_KEY must be configured as exactly 64 hexadecimal characters")
}

const ENCRYPTION_KEY = rawEncryptionKey
const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  return Buffer.from(ENCRYPTION_KEY, "hex")
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format")
  }

  const [ivHex, authTagHex, encrypted] = parts
  if (
    !/^[0-9a-fA-F]+$/.test(ivHex) ||
    ivHex.length !== IV_LENGTH * 2 ||
    !/^[0-9a-fA-F]+$/.test(authTagHex) ||
    authTagHex.length !== AUTH_TAG_LENGTH * 2 ||
    !/^[0-9a-fA-F]*$/.test(encrypted)
  ) {
    throw new Error("Invalid encrypted data")
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(ivHex, "hex"))
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"))

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512")
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, hashHex] = hashedPassword.split(":")
  if (!saltHex || !hashHex || !/^[0-9a-fA-F]+$/.test(saltHex) || !/^[0-9a-fA-F]+$/.test(hashHex)) {
    return false
  }

  const salt = Buffer.from(saltHex, "hex")
  const expectedHash = Buffer.from(hashHex, "hex")
  const actualHash = crypto.pbkdf2Sync(password, salt, 100000, expectedHash.length, "sha512")

  return expectedHash.length === actualHash.length && crypto.timingSafeEqual(expectedHash, actualHash)
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
