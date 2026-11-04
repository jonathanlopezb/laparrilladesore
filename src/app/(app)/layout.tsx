/**
 * src/app/(app)/layout.tsx
 * Layout protegido — Phase 0 esqueleto.
 * El guard de sesión se activa en P0-03.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar / Bottom nav — se construye en P0-04 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
