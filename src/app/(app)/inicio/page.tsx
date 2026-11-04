/**
 * src/app/(app)/inicio/page.tsx
 * Dashboard principal — Phase 0 esqueleto vacío.
 * Los KPIs reales se implementan en Phase 1+.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function InicioPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Panel Principal</h1>
      <p className="text-sm text-muted-foreground">
        Bienvenido a La Parrilla de Sore. El dashboard se construye en Phase 1.
      </p>
    </div>
  );
}
