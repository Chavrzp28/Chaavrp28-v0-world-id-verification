"use client"

import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface WorldIDVerifyProps {
  onSuccess?: () => void
  isVerified?: boolean
}

export function WorldIDVerify({ onSuccess, isVerified = false }: WorldIDVerifyProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const handleVerify = async (result: ISuccessResult) => {
    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-world-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proof: result.proof,
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          signal: "verify-identity",
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "¡Verificación exitosa!",
          description: "Tu identidad ha sido verificada con World ID",
        })
        onSuccess?.()
      } else {
        toast({
          title: "Error de verificación",
          description: data.error || "No se pudo verificar tu identidad",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Verification error:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error durante la verificación",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Verificado con World ID</span>
      </div>
    )
  }

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || "app_staging_c8f0e5e5e5e5e5e5e5e5e5e5"}
      action="verify-identity"
      signal="verify-identity"
      onSuccess={handleVerify}
      verification_level={VerificationLevel.Orb}
    >
      {({ open }) => (
        <Button onClick={open} disabled={isVerifying} className="w-full gap-2" size="lg">
          <Shield className="h-5 w-5" />
          {isVerifying ? "Verificando..." : "Verificar con World ID"}
        </Button>
      )}
    </IDKitWidget>
  )
}
