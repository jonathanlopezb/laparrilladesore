"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  DollarSign,
  PieChart,
  Flame,
  UserCheck,
  CheckCircle2,
  Printer,
  Calendar,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { SalesReportData } from "@/server/modules/reports/reports.service";
import { formatCOP } from "@/shared/money";

export default function ReportesPage() {
  const [report, setReport] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/reports");
      const data = await res.json();
      if (data.data) {
        setReport(data.data);
      }
    } catch (err) {
      console.error("Error al cargar reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleSettleCredit = async (orderId: string, debtor: string) => {
    if (!confirm(`¿Confirmas que el crédito de ${debtor} ya fue cancelado y recibido?`)) return;

    try {
      setSettlingId(orderId);
      const res = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settle", orderId }),
      });
      if (res.ok) {
        setSuccessToast(`¡Crédito de ${debtor} saldado exitosamente en base de datos!`);
        setTimeout(() => setSuccessToast(""), 3500);
        await loadReport();
      }
    } catch (err) {
      console.error("Error al saldar crédito:", err);
    } finally {
      setSettlingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSales = report?.totalRevenueCOP || 0;
  const methods = report?.byPaymentMethod || { cash: 0, nequi: 0, daviplata: 0, breb: 0, credit: 0 };
  const channels = report?.byChannel || { counter: 0, table: 0, takeaway: 0, delivery: 0 };
  const topDishes = report?.topDishes || [];
  const activeCredits = report?.activeCredits || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:m-0">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top duration-300 print:hidden">
          <CheckCircle2 className="h-5 w-5" />
          {successToast}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Reportes y Métricas de Ventas
            </h1>
            <p className="text-xs text-zinc-400">
              Análisis financiero, canales de despacho y cuentas por cobrar en MongoDB
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="print:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs shadow-md transition active:scale-95"
        >
          <Printer className="h-4 w-4 text-amber-500" />
          Imprimir Corte de Ventas
        </button>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Venta Bruta Total</span>
            <span className="text-2xl font-black text-emerald-400">{formatCOP(totalSales)}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Pedidos Registrados</span>
            <span className="text-2xl font-black text-white">{report?.ordersCount || 0}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Ticket Promedio</span>
            <span className="text-2xl font-black text-amber-400">
              {formatCOP(report?.averageTicketCOP || 0)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block">Créditos / Fiados Activos</span>
            <span className={`text-2xl font-black ${methods.credit > 0 ? "text-amber-400" : "text-zinc-500"}`}>
              {formatCOP(methods.credit)}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid: Métodos de Pago & Canales de Despacho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Desglose por Método de Pago */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-amber-500" />
            Ventas por Método de Pago
          </h3>

          <div className="space-y-3">
            {[
              { id: "cash", label: "💵 Efectivo (Gaveta)", val: methods.cash, color: "bg-emerald-500" },
              { id: "nequi", label: "🟣 Nequi", val: methods.nequi, color: "bg-purple-500" },
              { id: "daviplata", label: "🔴 Daviplata", val: methods.daviplata, color: "bg-rose-500" },
              { id: "breb", label: "⚡ Bre-B", val: methods.breb, color: "bg-sky-500" },
              { id: "credit", label: "📋 Crédito (Fiado por cobrar)", val: methods.credit, color: "bg-amber-500" },
            ].map((m) => {
              const pct = totalSales > 0 ? Math.round((m.val / totalSales) * 100) : 0;
              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{m.label}</span>
                    <span className="font-extrabold text-white">
                      {formatCOP(m.val)}{" "}
                      <span className="text-[11px] font-normal text-zinc-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${m.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desglose por Canal de Venta */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <PieChart className="h-4 w-4 text-orange-500" />
            Ventas por Canal de Despacho
          </h3>

          <div className="space-y-3">
            {[
              { id: "table", label: "🍽️ Consumo en Mesa", val: channels.table, color: "bg-amber-500" },
              { id: "counter", label: "🚶 Mostrador / Caja", val: channels.counter, color: "bg-orange-500" },
              { id: "takeaway", label: "🥡 Para Llevar", val: channels.takeaway, color: "bg-emerald-500" },
              { id: "delivery", label: "🛵 Domicilios", val: channels.delivery, color: "bg-blue-500" },
            ].map((c) => {
              const pct = totalSales > 0 ? Math.round((c.val / totalSales) * 100) : 0;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-300">{c.label}</span>
                    <span className="font-extrabold text-white">
                      {formatCOP(c.val)}{" "}
                      <span className="text-[11px] font-normal text-zinc-500">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ranking de Platos Más Vendidos */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
        <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500" />
          Ranking de Platos de la Parrilla
        </h3>

        {topDishes.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">
            Aún no se han registrado órdenes con detalle de platos.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topDishes.map((dish, idx) => (
              <div
                key={dish.name}
                className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 text-xs font-black">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-extrabold text-white text-xs">{dish.name}</p>
                    <span className="text-[11px] text-zinc-400">{dish.quantity} platos despachados</span>
                  </div>
                </div>
                <span className="font-black text-amber-400 text-xs">{formatCOP(dish.totalCOP)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cuentas por Cobrar (Fiados activos) */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-amber-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-500" />
              Cuentas por Cobrar (Créditos y Fiados Activos)
            </h3>
            <p className="text-[11px] text-zinc-400">
              Registros con saldo pendiente y responsable que autorizó la entrega
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-800">
            {activeCredits.length} fiados pendientes
          </span>
        </div>

        {activeCredits.length === 0 ? (
          <div className="py-6 text-center text-xs text-emerald-400 font-semibold bg-emerald-950/15 border border-emerald-900/40 rounded-xl">
            ✓ ¡No hay créditos pendientes por cobrar! Todas las cuentas están al día.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {activeCredits.map((cred) => (
              <div
                key={cred.orderId}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{cred.debtorName}</span>
                    <span className="text-[10px] font-mono text-zinc-500">[{cred.orderNumber}]</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                    <span>
                      Autorizó: <strong className="text-amber-400">{cred.authorizedBy}</strong>
                    </span>
                    <span>•</span>
                    <span>Fecha: {cred.date}</span>
                    <span>•</span>
                    <span className="capitalize">Canal: {cred.channel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-amber-400 text-base">{formatCOP(cred.amountCOP)}</span>
                  <button
                    onClick={() => handleSettleCredit(cred.orderId, cred.debtorName)}
                    disabled={settlingId === cred.orderId}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs transition active:scale-95 disabled:opacity-50"
                  >
                    {settlingId === cred.orderId ? "Cobrando..." : "✓ Marcar Cobrado"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
