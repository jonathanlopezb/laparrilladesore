"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Users,
  Truck,
  Package,
  Calculator,
  BarChart3,
  Settings,
  PlusCircle,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { usePosStore } from "@/modules/orders/pos-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { orders } = usePosStore();

  const activeOrdersCount = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "IN_PREPARATION"
  ).length;

  const NAV_ITEMS = [
    { label: "Inicio", href: "/", icon: LayoutDashboard },
    { label: "Crear Pedido", href: "/pedidos/nuevo", icon: PlusCircle, highlight: true },
    { label: "Cocina y Pedidos", href: "/pedidos", icon: ChefHat, badge: activeOrdersCount },
    { label: "Menú y Precios", href: "/menu", icon: UtensilsCrossed },
    { label: "CRM Clientes", href: "/clientes", icon: Users },
  ];

  const SECONDARY_NAV = [
    { label: "Proveedores", href: "/proveedores", icon: Truck },
    { label: "Inventario", href: "/inventario", icon: Package },
    { label: "Caja y Turno", href: "/caja", icon: Calculator },
    { label: "Reportes", href: "/reportes", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 flex">
      {/* SIDEBAR DESKTOP (Inspirado en el diseño del mockup) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-zinc-800/80 bg-[#121212] p-4 shrink-0 fixed top-0 bottom-0 left-0 z-40">
        <div className="space-y-6">
          {/* Logo y Marca */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 shadow-xl shadow-orange-500/25">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white leading-none block">
                La Parrilla de Sore
              </span>
              <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">
                Sabor que une
              </span>
            </div>
          </Link>

          {/* Menú Principal */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Operaciones
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5"
                      : item.highlight
                      ? "bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : ""}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Módulos de Gestión */}
          <div className="space-y-1 pt-2 border-t border-zinc-800/80">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Administración
            </p>
            {SECONDARY_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : ""}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Perfil Administrador en Footer */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white text-xs">
                JL
              </div>
              <div>
                <p className="text-xs font-bold text-white">Jonathan López</p>
                <p className="text-[10px] text-zinc-400">Administrador</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">v1.0</span>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* TOP BAR DESKTOP / MOBILE */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/80 bg-[#121212]/95 px-4 py-3 backdrop-blur-md">
          {/* Logo en Mobile */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-white leading-tight block">
                La Parrilla de Sore
              </span>
              <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
                POS & CRM Mobile
              </span>
            </div>
          </div>

          {/* Buscador en Desktop */}
          <div className="hidden lg:flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl w-72 text-xs">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar plato, pedido o cliente..."
              className="bg-transparent text-white placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>

          {/* Acciones del Encabezado */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Base de Datos Activa
            </span>

            <Link
              href="/pedidos/nuevo"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-xs text-white shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <PlusCircle className="h-4 w-4" /> Nuevo Pedido
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Drawer Mobile Desplegable */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#141414] border-b border-zinc-800 p-4 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Operaciones Principales
              </p>
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                        isActive
                          ? "bg-amber-600/20 border-amber-500/40 text-amber-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-amber-500" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Administración y Control
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition ${
                        isActive
                          ? "bg-amber-600/20 border-amber-500/40 text-amber-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-orange-500" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 pb-24 lg:pb-8">{children}</main>

        {/* BARRA INFERIOR PWA (Mobile-First 360/390 px) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-zinc-800/90 bg-[#121212]/95 backdrop-blur-xl px-2 py-1.5 shadow-2xl">
          <div className="flex items-center justify-around">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                pathname === "/" ? "text-amber-500 font-bold" : "text-zinc-400"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Inicio</span>
            </Link>

            <Link
              href="/pedidos/nuevo"
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                pathname === "/pedidos/nuevo" ? "text-amber-500 font-bold" : "text-zinc-400"
              }`}
            >
              <PlusCircle className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">POS</span>
            </Link>

            <Link
              href="/pedidos"
              className={`relative flex flex-col items-center justify-center py-1 px-3 ${
                pathname === "/pedidos" ? "text-amber-500 font-bold" : "text-zinc-400"
              }`}
            >
              <ChefHat className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Cocina</span>
              {activeOrdersCount > 0 && (
                <span className="absolute top-0.5 right-2 h-4 w-4 rounded-full bg-orange-600 text-[9px] font-black text-white flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            <Link
              href="/menu"
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                pathname === "/menu" ? "text-amber-500 font-bold" : "text-zinc-400"
              }`}
            >
              <UtensilsCrossed className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Menú</span>
            </Link>

            <Link
              href="/clientes"
              className={`flex flex-col items-center justify-center py-1 px-3 ${
                pathname === "/clientes" ? "text-amber-500 font-bold" : "text-zinc-400"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">CRM</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
