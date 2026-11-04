"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  X,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import type { InventoryItem } from "@/server/modules/inventory/inventory.service";
import { formatCOP } from "@/shared/money";

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<"IN_PURCHASE" | "OUT_WASTE" | "ADJUSTMENT">("IN_PURCHASE");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/inventory");
      const data = await res.json();
      if (data.data) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Error al cargar inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleOpenMovementModal = (item?: InventoryItem) => {
    setSelectedItem(item || items[0] || null);
    setQuantity(1);
    setReason("");
    setMovementType("IN_PURCHASE");
    setIsModalOpen(true);
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: selectedItem.id,
          movementType,
          quantity: Number(quantity),
          reason: reason || (movementType === "IN_PURCHASE" ? "Compra regular de insumos" : "Consumo / Merma de cocina"),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSuccessToast(`¡Stock de ${selectedItem.name} actualizado en base de datos!`);
        setTimeout(() => setSuccessToast(""), 3500);
        await loadInventory();
      }
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = items.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Métricas
  const totalItemsCount = items.length;
  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;
  const totalValuation = items.reduce((acc, curr) => acc + curr.currentStock * curr.unitCostCOP, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast de Éxito */}
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
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Control de Inventario y Stock
            </h1>
            <p className="text-xs text-zinc-400">
              Insumos, carnes, salsas y empaques en tiempo real sincronizados con MongoDB
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenMovementModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition"
        >
          <ArrowUpDown className="h-4 w-4" />
          Registrar Entrada / Salida
        </button>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Insumos Registrados</p>
            <p className="text-2xl font-black text-white">{totalItemsCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Alerta: Stock Bajo</p>
            <p className={`text-2xl font-black ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {lowStockCount} {lowStockCount === 1 ? "insumo" : "insumos"}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Valoración Estimada</p>
            <p className="text-2xl font-black text-amber-400">{formatCOP(totalValuation)}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filtros por Categoría */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "Todos" },
          { id: "carnes", label: "🍗 Carnes" },
          { id: "verduras", label: "🥔 Papas y Verduras" },
          { id: "insumos", label: "🧂 Salsas y Carbón" },
          { id: "empaques", label: "📦 Empaques" },
          { id: "bebidas", label: "🥤 Bebidas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              categoryFilter === tab.id
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-[#141414] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar insumo por nombre o código SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#141414] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Listado de Insumos */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Cargando inventario desde MongoDB...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141414] border border-zinc-800 text-center space-y-2">
          <Package className="h-10 w-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-zinc-300">No hay insumos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isLow = item.currentStock <= item.minStock;
            const healthPercent = Math.min(100, Math.round((item.currentStock / (item.minStock * 2 || 1)) * 100));

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#141414] border transition flex flex-col justify-between space-y-4 shadow-lg ${
                  isLow ? "border-rose-900/60 bg-rose-950/10" : "border-zinc-800/80 hover:border-amber-500/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500">{item.sku}</span>
                      <h3 className="font-extrabold text-white text-base leading-tight mt-0.5">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 capitalize">
                        Categoría: <strong className="text-zinc-200">{item.category}</strong>
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isLow
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isLow ? "Stock Crítico" : "Stock Óptimo"}
                    </span>
                  </div>

                  {/* Stock actual con barra visual */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-zinc-800/80">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-zinc-400">Existencia actual:</span>
                      <span className="text-xl font-black text-white">
                        {item.currentStock}{" "}
                        <span className="text-xs font-semibold text-zinc-400">{item.unit}</span>
                      </span>
                    </div>

                    {/* Barra de nivel */}
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLow ? "bg-rose-500" : healthPercent < 50 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, healthPercent)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-zinc-500 pt-0.5">
                      <span>Mínimo seguro: {item.minStock} {item.unit}</span>
                      <span>Costo unit: {formatCOP(item.unitCostCOP)}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones de Ajuste Rápido */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setMovementType("IN_PURCHASE");
                      setIsModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Entrada
                  </button>

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setMovementType("OUT_WASTE");
                      setIsModalOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 font-bold text-xs transition"
                  >
                    <Minus className="h-3.5 w-3.5" /> - Salida
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Movimiento */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-amber-500" />
                Registrar Movimiento de Insumo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Insumo a Modificar</label>
                <select
                  value={selectedItem.id}
                  onChange={(e) => {
                    const found = items.find((i) => i.id === e.target.value);
                    if (found) setSelectedItem(found);
                  }}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stock: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Tipo de Operación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType("IN_PURCHASE")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      movementType === "IN_PURCHASE"
                        ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    📥 Entrada (Compra)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("OUT_WASTE")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      movementType === "OUT_WASTE"
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    📤 Salida (Consumo/Merma)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Cantidad ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  required
                  value={quantity || ""}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder={`Ej: 5 ${selectedItem.unit}`}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-black text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Motivo / Factura / Observación</label>
                <input
                  type="text"
                  placeholder="Ej: Compra a Avícola La Granja / Merma de brasa"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 transition active:scale-98 disabled:opacity-50"
                >
                  {submitting ? "Actualizando en MongoDB..." : "Confirmar Movimiento en Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
