/**
 * src/app/(auth)/login/page.tsx
 * Página de login — Phase 0 esqueleto.
 * La lógica de Better Auth se conecta en P0-03.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            La Parrilla de Sore
          </h1>
          <p className="text-sm text-muted-foreground">
            Acceso exclusivo para el equipo
          </p>
        </div>

        {/* Formulario — se conecta en P0-03 con Better Auth */}
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            🔧 Autenticación se configura en P0-03
          </p>
        </div>
      </div>
    </main>
  );
}
