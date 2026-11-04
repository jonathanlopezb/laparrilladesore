"use client";

import Link from "next/link";
import {
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Users,
  AlertTriangle,
  PlusCircle,
  Truck,
  UserPlus,
  BarChart3,
  Calculator,
  Flame,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
} from "lucide-react";
import { usePosStore } from "@/modules/orders/pos-store";
import { formatCOP } from "@/shared/money";

export default function HomePage() {
  const { orders } = usePosStore();

  const totalSalesCOP = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + o.totalCOP, 0);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 pb-24 md:pb-8">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/80 bg-[#141414]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              La Parrilla de Sore
            </h1>
            <p className="text-[11px] font-medium tracking-wider text-amber-500 uppercase">
              Sabor que une · Panel Principal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            En línea
          </span>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800/80 px-2.5 py-1.5 text-xs">
            <span className="h-6 w-6 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white text-[11px]">
              JL
            </span>
            <span className="hidden sm:inline font-medium text-zinc-300">
              Jonathan López
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-amber-900/40 bg-gradient-to-r from-[#2A1508] via-[#1C120C] to-[#120D0A] p-5 shadow-2xl">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30 mb-2">
              <Flame className="h-3.5 w-3.5" />
              ERP + CRM + POS Gastronómico
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Gestión inteligente para un negocio exitoso
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-300">
              Monitoreo en tiempo real de pedidos, ventas, caja, inventario y deudas.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/pedidos/nuevo"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-95 transition"
              >
                <PlusCircle className="h-4 w-4" /> Abrir POS / Nuevo Pedido
              </Link>
              <Link
                href="/pedidos"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 font-semibold text-xs text-zinc-200 transition"
              >
                <ShoppingBag className="h-4 w-4" /> Ver Comandas de Cocina
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-orange-600/10 blur-3xl" />
        </div>
      </div>

      <main className="px-4 pt-4 space-y-4 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Pedidos Hoy</span>
              <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">{orders.length}</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> Activo
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Ventas Registradas</span>
              <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">
                {formatCOP(totalSalesCOP || 1248000)}
              </span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +15%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Clientes Atendidos</span>
              <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">18</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +10%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Deudas Pendientes</span>
              <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">$2.450.000</span>
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-400">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> +5%
              </span>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos Táctiles */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Módulos del Sistema
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <Link
              href="/pedidos/nuevo"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800 hover:border-amber-500/50 transition group"
            >
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Crear Pedido</span>
              <span className="text-[10px] text-zinc-500">POS Móvil</span>
            </Link>

            <Link
              href="/menu"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800 hover:border-amber-500/50 transition group"
            >
              <div className="h-9 w-9 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Menú</span>
              <span className="text-[10px] text-zinc-500">7 Platos</span>
            </Link>

            <Link
              href="/clientes"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800 hover:border-amber-500/50 transition group"
            >
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">CRM Clientes</span>
              <span className="text-[10px] text-zinc-500">Directorio</span>
            </Link>

            <Link
              href="/pedidos"
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800 hover:border-amber-500/50 transition group"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-200">Cocina</span>
              <span className="text-[10px] text-zinc-500">Comandas</span>
            </Link>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800/50 opacity-80">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1.5">
                <Truck className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-300">Proveedores</span>
              <span className="text-[10px] text-zinc-500">Insumos</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C1C] border border-zinc-800/50 opacity-80">
              <div className="h-9 w-9 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-1.5">
                <Calculator className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-zinc-300">Caja</span>
              <span className="text-[10px] text-zinc-500">Arqueos</span>
            </div>
          </div>
        </div>

        {/* 2 Columnas: Pedidos Recientes & Inventario Crítico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pedidos Recientes */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Pedidos Recientes</h3>
              </div>
              <Link
                href="/pedidos"
                className="text-xs font-medium text-amber-500 hover:underline"
              >
                Ver todos ({orders.length}) →
              </Link>
            </div>

            <div className="mt-3 space-y-2.5">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-200">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : order.status === "IN_PREPARATION"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-500">{order.createdAt}</span>
                    <span className="text-xs font-bold text-white">
                      {formatCOP(order.totalCOP)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inventario Crítico */}
          <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-bold text-white">Inventario Crítico</h3>
              </div>
              <span className="text-xs font-medium text-zinc-500">
                Insumos activos
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {[
                { name: "Carne de res", status: "Stock bajo", isLow: true, qty: "2 kg" },
                { name: "Pollo", status: "Stock bajo", isLow: true, qty: "1 kg" },
                { name: "Cerdo", status: "Stock OK", isLow: false, qty: "5 kg" },
                { name: "Chorizo", status: "Stock OK", isLow: false, qty: "8 kg" },
                { name: "Pan de ajo", status: "Stock OK", isLow: false, qty: "12 und" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60"
                >
                  <span className="text-xs font-medium text-zinc-200">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.isLow
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-zinc-300 w-12 text-right">
                      {item.qty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menú Oficial (7 Platos) */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#171717] p-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">
                Carta Oficial de Precios
              </h3>
            </div>
            <Link
              href="/menu"
              className="text-xs font-medium text-amber-500 hover:underline"
            >
              Ver menú completo y foto →
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { code: "POL-001", name: "Pollo", desc: "200 g de pollo asado", price: "$13.000" },
              { code: "CHU-001", name: "Chuleta", desc: "1 chuleta con hueso", price: "$12.000" },
              { code: "CHO-001", name: "Chorizo", desc: "1 chorizo asado", price: "$10.000" },
              { code: "COM-001", name: "Pollo + Chorizo", desc: "100 g pollo + 1 chorizo", price: "$15.000" },
              { code: "COM-002", name: "Chuleta + Chorizo", desc: "1 chuleta + 1 chorizo", price: "$14.000" },
              { code: "COM-003", name: "Chuleta + Pollo", desc: "1 chuleta + 100 g pollo", price: "$16.000" },
              { code: "ESP-001", name: "Parrillada Especial", desc: "Chuleta + pollo + chorizo", price: "$20.000" },
            ].map((p) => (
              <div
                key={p.code}
                className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-500 font-semibold">{p.code}</span>
                    <span className="text-xs font-bold text-white">{p.price}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 mt-1">{p.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Barra de Navegación Fija Móvil (Mobile-first 360-390px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-zinc-800 bg-[#121212]/95 backdrop-blur-lg px-2 py-1.5">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center justify-center py-1 px-3 text-amber-500"
          >
            <Flame className="h-5 w-5" />
            <span className="text-[10px] font-semibold mt-0.5">Inicio</span>
          </Link>
          <Link
            href="/pedidos/nuevo"
            className="flex flex-col items-center justify-center py-1 px-3 text-zinc-400 hover:text-white"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">POS</span>
          </Link>
          <Link
            href="/pedidos"
            className="flex flex-col items-center justify-center py-1 px-3 text-zinc-400 hover:text-white"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Cocina</span>
          </Link>
          <Link
            href="/clientes"
            className="flex flex-col items-center justify-center py-1 px-3 text-zinc-400 hover:text-white"
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">CRM</span>
          </Link>
          <Link
            href="/menu"
            className="flex flex-col items-center justify-center py-1 px-3 text-zinc-400 hover:text-white"
          >
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">Menú</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
