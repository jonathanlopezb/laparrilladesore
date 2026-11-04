"use client";

import { useState } from "react";
import Link from "next/link";
import { usePosStore, type OrderRecord } from "@/modules/orders/pos-store";
import { formatCOP } from "@/shared/money";
import {
  Flame,
  ArrowLeft,
  PlusCircle,
  Clock,
  CheckCircle2,
  ChefHat,
  Search,
  Filter,
  Check,
  Ban,
  Printer,
} from "lucide-react";

export default function PedidosPage() {
  const { orders, updateOrderStatus } = usePosStore();
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  const handleStatusChange = async (orderId: string, orderNumber: string, status: OrderRecord["status"]) => {
    updateOrderStatus(orderId, status);
    try {
      await fetch("/api/v1/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, status }),
      });
    } catch (e) {
      console.warn("Estado guardado localmente:", e);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "TODOS"
        ? true
        : filterStatus === "COCINA"
        ? order.status === "CONFIRMED" || order.status === "IN_PREPARATION"
        : order.status === filterStatus;

    const matchesSearch =
      searchQuery === ""
        ? true
        : order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return { label: "Confirmado", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "IN_PREPARATION":
        return { label: "En Preparación", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "READY":
        return { label: "Listo p/ Entrega", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      case "DELIVERED":
        return { label: "Entregado", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "CANCELLED":
        return { label: "Cancelado", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800 bg-[#141414]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-1.5">
              <ChefHat className="h-4 w-4 text-amber-500" />
              Gestión de Pedidos y Cocina
            </h1>
            <p className="text-[11px] text-zinc-400">
              Control de comandas en tiempo real
            </p>
          </div>
        </div>

        <Link
          href="/pedidos/nuevo"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Pedido</span>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "TODOS", label: "Todos" },
              { id: "COCINA", label: "🔥 En Cocina" },
              { id: "READY", label: "Listos" },
              { id: "DELIVERED", label: "Entregados" },
              { id: "CANCELLED", label: "Cancelados" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterStatus === tab.id
                    ? "bg-amber-600 text-white"
                    : "bg-[#1C1C1C] text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar pedido o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171717] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-[#171717] rounded-2xl border border-zinc-800/80 p-6 space-y-2 text-zinc-500">
              <ChefHat className="h-10 w-10 mx-auto stroke-1" />
              <p className="text-sm font-medium">No hay pedidos en este estado.</p>
              <Link
                href="/pedidos/nuevo"
                className="inline-block text-xs text-amber-500 hover:underline pt-1"
              >
                Crear nuevo pedido desde el POS →
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-800 bg-[#171717] p-4 space-y-3 shadow-md"
                >
                  {/* Encabezado pedido */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-amber-400 font-mono">
                        {order.orderNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {order.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 uppercase">
                        {order.channel} {order.tableNumber ? `(Mesa ${order.tableNumber})` : ""}
                      </span>
                      <span className="text-sm font-black text-white">
                        {formatCOP(order.totalCOP)}
                      </span>
                    </div>
                  </div>

                  {/* Cliente y Notas */}
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-zinc-300">
                      <strong>Cliente:</strong> {order.customer.name}{" "}
                      {order.customer.phone && <span className="text-zinc-500">({order.customer.phone})</span>}
                    </p>
                    <p className="text-zinc-400 text-[11px]">
                      Pago: <span className="font-semibold text-zinc-200 uppercase">{order.paymentMethod}</span>
                    </p>
                  </div>

                  {/* Platos */}
                  <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 space-y-1.5">
                    {order.lines.map((l, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold text-white mr-1.5">
                            {l.quantity}x
                          </span>
                          <span className="text-zinc-300">{l.name}</span>
                          {l.notes && (
                            <span className="block text-[11px] text-amber-400/90 italic">
                              Nota: {l.notes}
                            </span>
                          )}
                        </div>
                        <span className="text-zinc-400 font-medium">
                          {formatCOP(l.subtotalCOP)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Acciones de cambio de estado de cocina */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      {order.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatusChange(order.id, order.orderNumber, "IN_PREPARATION")}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <ChefHat className="h-3.5 w-3.5" /> Pasar a Cocina
                        </button>
                      )}

                      {order.status === "IN_PREPARATION" && (
                        <button
                          onClick={() => handleStatusChange(order.id, order.orderNumber, "READY")}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <Check className="h-3.5 w-3.5" /> Marcar Listo
                        </button>
                      )}

                      {order.status === "READY" && (
                        <button
                          onClick={() => handleStatusChange(order.id, order.orderNumber, "DELIVERED")}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Entregar Pedido
                        </button>
                      )}

                      {order.status === "DELIVERED" && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> Pedido Finalizado
                        </span>
                      )}
                    </div>

                    {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                      <button
                        onClick={() => handleStatusChange(order.id, order.orderNumber, "CANCELLED")}
                        className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition"
                      >
                        <Ban className="h-3.5 w-3.5" /> Anular
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
