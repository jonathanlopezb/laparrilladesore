"use client";

import { useState, useEffect } from "react";
import {
  Calculator,
  Lock,
  Unlock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  Clock,
  Sparkles,
} from "lucide-react";
import type { CashTurnoSummary } from "@/server/modules/cash/cash.service";
import { formatCOP } from "@/shared/money";

export default function CajaTurnoPage() {
  const [summary, setSummary] = useState<CashTurnoSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [successToast, setSuccessToast] = useState("");

  // Modales
  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [isCloseModalActive, setIsCloseModalActive] = useState(false);
  const [isMovementModalActive, setIsMovementModalActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [openingFloat, setOpeningFloat] = useState<number>(0);
  const [openingNotes, setOpeningNotes] = useState("");
  const [countedCash, setCountedCash] = useState<number>(0);
  const [diffReason, setDiffReason] = useState("");

  const [movDirection, setMovDirection] = useState<"in" | "out">("out");
  const [movAmount, setMovAmount] = useState<number>(0);
  const [movCategory, setMovCategory] = useState<"egreso_menor" | "ingreso_extra" | "pago_domicilio" | "compra_urgente">("egreso_menor");
  const [movReason, setMovReason] = useState("");

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/cash-sessions");
      const data = await res.json();
      if (data.data) {
        setSummary(data.data);
        if (data.data.expectedCashCOP) {
          setCountedCash(data.data.expectedCashCOP);
        }
      }
    } catch (err) {
      console.error("Error al cargar resumen de caja:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/cash-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "open",
          openingFloatCOP: Number(openingFloat),
          openedBy: "Jonathan López",
          notes: openingNotes,
        }),
      });
      if (res.ok) {
        setIsOpenModalActive(false);
        setSuccessToast("¡Turno de caja abierto correctamente en MongoDB!");
        setTimeout(() => setSuccessToast(""), 3500);
        await loadSummary();
      }
    } catch (err) {
      console.error("Error al abrir turno:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/cash-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "close",
          countedCashCOP: Number(countedCash),
          differenceReason: diffReason,
          closedBy: "Jonathan López",
        }),
      });
      if (res.ok) {
        setIsCloseModalActive(false);
        setSuccessToast("¡Arqueo finalizado y turno cerrado en base de datos!");
        setTimeout(() => setSuccessToast(""), 3500);
        await loadSummary();
      }
    } catch (err) {
      console.error("Error al cerrar turno:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (movAmount <= 0 || !movReason.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/cash-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "movement",
          direction: movDirection,
          amountCOP: Number(movAmount),
          category: movCategory,
          reason: movReason,
        }),
      });
      if (res.ok) {
        setIsMovementModalActive(false);
        setMovAmount(0);
        setMovReason("");
        setSuccessToast("¡Movimiento de caja registrado exitosamente!");
        setTimeout(() => setSuccessToast(""), 3500);
        await loadSummary();
      }
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isSessionOpen = summary?.currentSession?.status === "open";
  const expectedCash = summary?.expectedCashCOP || 0;
  const difference = (countedCash || 0) - expectedCash;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-5 w-5" />
          {successToast}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Caja, Turno y Arqueo
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isSessionOpen
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                {isSessionOpen ? "● Caja Abierta" : "○ Caja Cerrada"}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Control de efectivo en gaveta, egresos menores y balance en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSessionOpen ? (
            <>
              <button
                onClick={() => setIsMovementModalActive(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs transition"
              >
                <PlusCircle className="h-4 w-4 text-amber-500" />
                Gasto / Movimiento
              </button>
              <button
                onClick={() => {
                  setCountedCash(expectedCash);
                  setIsCloseModalActive(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-extrabold text-xs transition active:scale-95"
              >
                <Lock className="h-4 w-4" />
                Cerrar Turno (Arqueo)
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenModalActive(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition active:scale-95"
            >
              <Unlock className="h-4 w-4" />
              Abrir Nueva Caja
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta Principal de Arqueo de Efectivo */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#161616] to-[#121212] border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Efectivo Esperado en Gaveta
            </span>
            <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatCOP(expectedCash)}
            </p>
            <p className="text-xs text-zinc-400">
              {isSessionOpen
                ? `Turno iniciado por ${summary?.currentSession?.openedBy || "Jonathan"} con base de ${formatCOP(
                    summary?.openingFloatCOP || 0
                  )}`
                : "La caja está actualmente cerrada. Abre un nuevo turno para operar."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Base Inicial</span>
              <span className="text-base font-extrabold text-white">
                {formatCOP(summary?.openingFloatCOP || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Ventas Efectivo</span>
              <span className="text-base font-extrabold text-emerald-400">
                +{formatCOP(summary?.cashSalesCOP || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Gastos Menores / Salidas</span>
              <span className="text-base font-extrabold text-rose-400">
                -{formatCOP(summary?.cashOutflowCOP || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">Ingresos Adicionales</span>
              <span className="text-base font-extrabold text-sky-400">
                +{formatCOP(summary?.cashInflowCOP || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Otros Medios de Pago */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Transferencias Digitales</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold">
              Nequi / Davi / Bre-B
            </span>
          </div>
          <p className="text-xl font-black text-purple-400">
            {formatCOP(summary?.transferSalesCOP || 0)}
          </p>
          <span className="text-[11px] text-zinc-500">Depositados directamente a cuentas</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ventas a Crédito (Fiados)</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              Cuentas por Cobrar
            </span>
          </div>
          <p className="text-xl font-black text-amber-400">
            {formatCOP(summary?.creditSalesCOP || 0)}
          </p>
          <span className="text-[11px] text-zinc-500">Autorizados por Sore / Jonathan</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Ventas Brutas Turno</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              Venta Total
            </span>
          </div>
          <p className="text-xl font-black text-emerald-400">
            {formatCOP(summary?.totalSalesCOP || 0)}
          </p>
          <span className="text-[11px] text-zinc-500">Suma de todos los canales</span>
        </div>
      </div>

      {/* Historial de Movimientos de Caja Menor */}
      <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-amber-500" />
            Movimientos y Egresos Menores de Caja
          </h3>
          <span className="text-xs text-zinc-500">
            {summary?.recentMovements.length || 0} movimientos registrados
          </span>
        </div>

        {summary?.recentMovements.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No se han registrado salidas ni entradas menores en este turno.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {summary?.recentMovements.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      m.direction === "in"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {m.direction === "in" ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{m.reason}</p>
                    <span className="text-[11px] text-zinc-500 capitalize">
                      {m.category.replace("_", " ")} • {new Date(m.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      m.direction === "in" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {m.direction === "in" ? "+" : "-"}
                    {formatCOP(m.amountCOP)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Abrir Turno */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Unlock className="h-5 w-5 text-emerald-500" />
                Apertura de Caja y Turno
              </h3>
              <button
                onClick={() => setIsOpenModalActive(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Base Inicial en Efectivo (COP) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={openingFloat}
                  onChange={(e) => setOpeningFloat(Number(e.target.value))}
                  placeholder="Ej: 50000"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Observaciones de Apertura</label>
                <input
                  type="text"
                  placeholder="Ej: Sencillo en monedas y billetes de 2k y 5k"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition active:scale-98"
              >
                {submitting ? "Iniciando Turno..." : "Confirmar e Iniciar Turno"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Gasto / Movimiento Menor */}
      {isMovementModalActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-amber-500" />
                Registrar Movimiento de Caja
              </h3>
              <button
                onClick={() => setIsMovementModalActive(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovDirection("out")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      movDirection === "out"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    🔴 Egreso / Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovDirection("in")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      movDirection === "in"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    🟢 Ingreso Extra
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Concepto / Categoría</label>
                <select
                  value={movCategory}
                  onChange={(e) => setMovCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="egreso_menor">Gasto menor de cocina</option>
                  <option value="compra_urgente">Compra urgente de insumo (carbón, cilantro...)</option>
                  <option value="pago_domicilio">Pago a domiciliario</option>
                  <option value="ingreso_extra">Ingreso extra o recarga de base</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Monto (COP) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={movAmount || ""}
                  onChange={(e) => setMovAmount(Number(e.target.value))}
                  placeholder="Ej: 10000"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-base font-black text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Detalle o Motivo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Compra de bolsa de hielo / Pago domicilio pedido #4"
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 transition active:scale-98"
              >
                {submitting ? "Guardando en DB..." : "Registrar en Caja"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cerrar Turno / Arqueo */}
      {isCloseModalActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Lock className="h-5 w-5 text-rose-500" />
                Cierre de Turno y Arqueo Físico
              </h3>
              <button
                onClick={() => setIsCloseModalActive(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Efectivo calculado por sistema:</span>
                  <span className="font-bold text-white">{formatCOP(expectedCash)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Efectivo Contado Físicamente en Gaveta (COP) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="500"
                  value={countedCash || ""}
                  onChange={(e) => setCountedCash(Number(e.target.value))}
                  placeholder="Digita el valor exacto del conteo"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-lg font-black text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Diferencia / Descuadre */}
              <div
                className={`p-3 rounded-xl border flex justify-between items-center text-xs ${
                  difference === 0
                    ? "bg-emerald-950/20 border-emerald-900 text-emerald-400"
                    : difference > 0
                    ? "bg-amber-950/20 border-amber-900 text-amber-400"
                    : "bg-rose-950/20 border-rose-900 text-rose-400"
                }`}
              >
                <span>{difference === 0 ? "Caja Cuadrada Exacta" : difference > 0 ? "Sobrante de Caja:" : "Faltante de Caja:"}</span>
                <span className="font-black text-sm">{formatCOP(difference)}</span>
              </div>

              {difference !== 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Justificación de la Diferencia</label>
                  <input
                    type="text"
                    placeholder="Ej: Cambio no entregado / Vueltos aproximados"
                    value={diffReason}
                    onChange={(e) => setDiffReason(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 transition active:scale-98"
              >
                {submitting ? "Cerrando Turno..." : "Confirmar Cierre y Guardar en DB"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
