"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { usePosStore } from "@/modules/orders/pos-store";
import { formatCOP } from "@/shared/money";

export default function HomePage() {
  const { orders, fetchOrders } = usePosStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalSalesCOP = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((acc, o) => acc + o.totalCOP, 0);

  const uniqueCustomersCount = new Set(
    orders.map((o) => o.customer.name).filter((n) => n && n !== "Cliente General")
  ).size;

  return (
    <div className="p-4 space-y-5 max-w-7xl mx-auto">
      {/* Hero Banner Inspirado en el Mockup de La Parrilla de Sore */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/40 bg-gradient-to-r from-[#241307] via-[#1B110B] to-[#110D0A] p-6 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30 mb-3">
            <Flame className="h-3.5 w-3.5" />
            Sistema de Gestión Integral · Base de Datos Activa
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gestión inteligente para un negocio exitoso
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Punto de venta táctil, monitor de cocina, catálogo dinámico de 7 platos, CRM de clientes y control de deudas en tiempo real.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/pedidos/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-extrabold text-xs text-white shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-95 transition"
            >
              <PlusCircle className="h-4 w-4" /> Tomar Nuevo Pedido (POS)
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-bold text-xs text-zinc-200 transition"
            >
              <UtensilsCrossed className="h-4 w-4 text-amber-500" /> Editar Precios y Carta
            </Link>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 h-52 w-52 rounded-full bg-orange-600/15 blur-3xl pointer-events-none" />
      </div>

      {/* Tarjetas de Métricas (KPIs Reales) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-[#171717] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Pedidos Hoy</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{orders.length}</span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> Activo
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#171717] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Ventas Registradas</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {formatCOP(totalSalesCOP)}
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-zinc-400">
              Hoy
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#171717] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Clientes Atendidos</span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{uniqueCustomersCount}</span>
            <span className="inline-flex items-center text-[11px] font-bold text-zinc-400">
              Registrados
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#171717] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Deudas Pendientes</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">$0</span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-400">
              Al día
            </span>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos Táctiles (Mobile & Desktop) */}
      <div>
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
          Módulos Principales
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <Link
            href="/pedidos/nuevo"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800 hover:border-amber-500/60 transition group shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-200">Crear Pedido</span>
            <span className="text-[10px] text-zinc-500">POS Táctil</span>
          </Link>

          <Link
            href="/menu"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800 hover:border-amber-500/60 transition group shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-200">Menú</span>
            <span className="text-[10px] text-zinc-500">Editor en BD</span>
          </Link>

          <Link
            href="/clientes"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800 hover:border-amber-500/60 transition group shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-200">CRM Clientes</span>
            <span className="text-[10px] text-zinc-500">WhatsApp</span>
          </Link>

          <Link
            href="/pedidos"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800 hover:border-amber-500/60 transition group shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-200">Cocina</span>
            <span className="text-[10px] text-zinc-500">Comandas</span>
          </Link>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800/60 opacity-80 cursor-default">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1.5">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-300">Proveedores</span>
            <span className="text-[10px] text-zinc-500">Facturas</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#171717] border border-zinc-800/60 opacity-80 cursor-default">
            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-1.5">
              <Calculator className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-zinc-300">Caja</span>
            <span className="text-[10px] text-zinc-500">Arqueos</span>
          </div>
        </div>
      </div>

      {/* 2 Columnas: Pedidos Recientes & Inventario Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pedidos Recientes */}
        <div className="rounded-2xl border border-zinc-800 bg-[#171717] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Pedidos Recientes</h3>
            </div>
            <Link
              href="/pedidos"
              className="text-xs font-bold text-amber-500 hover:underline"
            >
              Ver todos ({orders.length}) →
            </Link>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {orders.length === 0 ? (
              <div className="text-center py-8 rounded-xl bg-zinc-900/40 border border-zinc-800/50 p-4 space-y-2">
                <p className="text-xs text-zinc-400">No hay pedidos registrados hoy.</p>
                <Link
                  href="/pedidos/nuevo"
                  className="inline-block text-xs font-bold text-amber-500 hover:underline"
                >
                  Tomar primer pedido en el POS →
                </Link>
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-200">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                    <span className="text-xs font-black text-white">
                      {formatCOP(order.totalCOP)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inventario Crítico */}
        <div className="rounded-2xl border border-zinc-800 bg-[#171717] p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-bold text-white">Inventario Crítico</h3>
            </div>
            <span className="text-xs text-zinc-500">Insumos principales</span>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {[
              { name: "Carne de res", status: "Stock bajo", isLow: true, qty: "2 kg" },
              { name: "Pollo", status: "Stock bajo", isLow: true, qty: "1 kg" },
              { name: "Cerdo", status: "Stock OK", isLow: false, qty: "5 kg" },
              { name: "Chorizo", status: "Stock OK", isLow: false, qty: "8 kg" },
              { name: "Pan de ajo", status: "Stock OK", isLow: false, qty: "12 und" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/70"
              >
                <span className="text-xs font-semibold text-zinc-200">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.isLow
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs font-black text-zinc-300 w-12 text-right">
                    {item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
