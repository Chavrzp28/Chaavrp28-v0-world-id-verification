import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, Database } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary p-6">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-balance">Sistema de Seguridad con World ID</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Autenticación avanzada con verificación biométrica, encriptación de datos y protección multicapa
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">Crear Cuenta</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
            <h3 className="font-semibold">World ID Verification</h3>
            <p className="text-sm text-muted-foreground">Verificación biométrica con tecnología de Worldcoin</p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
            <h3 className="font-semibold">Encriptación AES-256</h3>
            <p className="text-sm text-muted-foreground">
              Datos sensibles protegidos con encriptación de grado militar
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
            <h3 className="font-semibold">Auditoría Completa</h3>
            <p className="text-sm text-muted-foreground">Registro detallado de todos los eventos de seguridad</p>
          </div>

          <div className="rounded-lg border bg-card p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                <Database className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
            <h3 className="font-semibold">Base de Datos Segura</h3>
            <p className="text-sm text-muted-foreground">PostgreSQL con protección contra inyección SQL</p>
          </div>
        </div>

        <div className="mt-16 rounded-lg border bg-card p-8">
          <h2 className="text-2xl font-bold mb-4">Características de Seguridad</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Contraseñas hasheadas con PBKDF2 (100,000 iteraciones)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Sesiones seguras con tokens únicos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Protección contra fuerza bruta (bloqueo temporal)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Middleware de seguridad con headers HTTP</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Encriptación AES-256-GCM para datos sensibles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Verificación biométrica con World ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Logs de auditoría completos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-sm">Protección contra ataques comunes (XSS, CSRF)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
