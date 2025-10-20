import { redirect } from "next/navigation"
import { getSession, destroySession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WorldIDVerify } from "@/components/world-id-verify"
import { Shield, LogOut, CheckCircle2, XCircle } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const handleLogout = async () => {
    "use server"
    await destroySession()
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl space-y-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <p className="text-muted-foreground">Bienvenido, {session.user.username}</p>
          </div>
          <form action={handleLogout}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Estado de Seguridad
              </CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Usuario:</span>
                <span className="text-sm text-muted-foreground">{session.user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-muted-foreground">{session.user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">World ID:</span>
                {session.user.world_id_verified ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verificado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    No verificado
                  </Badge>
                )}
              </div>
              {session.user.wallet_address && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wallet:</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {session.user.wallet_address.slice(0, 6)}...{session.user.wallet_address.slice(-4)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verificación de Identidad
              </CardTitle>
              <CardDescription>Verifica tu identidad con World ID para mayor seguridad</CardDescription>
            </CardHeader>
            <CardContent>
              <WorldIDVerify isVerified={session.user.world_id_verified} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Características de Seguridad</CardTitle>
            <CardDescription>Tu cuenta está protegida con:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Encriptación de contraseñas con PBKDF2</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Sesiones seguras con tokens únicos</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Protección contra fuerza bruta (5 intentos máx.)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Registro de actividad de seguridad</span>
              </li>
              <li className="flex items-center gap-2">
                {session.user.world_id_verified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">Verificación biométrica con World ID</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
