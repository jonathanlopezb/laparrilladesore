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
  Truck,
  Store,
  DollarSign,
  History,
  FileText,
  Calendar,
} from "lucide-react";
import type { InventoryItem, StockMovementRecord } from "@/server/modules/inventory/inventory.service";
import { formatCOP } from "@/shared/money";

interface SupplierOption {
  id: string;
  name: string;
  supplyType?: string;
}

export default function InventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<"IN_PURCHASE" | "OUT_WASTE" | "ADJUSTMENT">("IN_PURCHASE");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("Avícola La Granja Campesina");
  const [customSupplier, setCustomSupplier] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [resInv, resSup] = await Promise.all([
        fetch("/api/v1/inventory"),
        fetch("/api/v1/suppliers"),
      ]);

      const dataInv = await resInv.json();
      if (dataInv.data) {
        if (Array.isArray(dataInv.data)) {
          setItems(dataInv.data);
        } else if (dataInv.data.items) {
          setItems(dataInv.data.items);
          setMovements(dataInv.data.movements || []);
        }
      }

      const dataSup = await resSup.json();
      if (dataSup.data && Array.isArray(dataSup.data)) {
        setSuppliers(dataSup.data);
      }
    } catch (err) {
      console.error("Error al cargar datos de inventario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMovementModal = (item?: InventoryItem, type: "IN_PURCHASE" | "OUT_WASTE" = "IN_PURCHASE") => {
    const targetItem = item || items[0] || null;
    setSelectedItem(targetItem);
    setQuantity(1);
    setUnitCost(targetItem ? targetItem.unitCostCOP : 0);
    setReason("");
    setMovementType(type);
    setSelectedSupplier("Avícola La Granja Campesina");
    setCustomSupplier("");
    setIsModalOpen(true);
  };

  const handleItemChange = (itemId: string) => {
    const found = items.find((i) => i.id === itemId);
    if (found) {
      setSelectedItem(found);
      setUnitCost(found.unitCostCOP || 0);
    }
  };

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || quantity <= 0) return;

    const supplierFinalName =
      movementType === "IN_PURCHASE"
        ? selectedSupplier === "custom"
          ? customSupplier.trim() || "Tienda / Proveedor Particular"
          : selectedSupplier
        : undefined;

    const totalCalculated = Math.round(Number(quantity) * Number(unitCost || selectedItem.unitCostCOP || 0));

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientId: selectedItem.id,
          movementType,
          quantity: Number(quantity),
          unitCostCOP: movementType === "IN_PURCHASE" ? Number(unitCost) : undefined,
          totalCostCOP: movementType === "IN_PURCHASE" ? totalCalculated : undefined,
          supplierName: supplierFinalName,
          reason:
            reason ||
            (movementType === "IN_PURCHASE"
              ? `Compra a ${supplierFinalName}`
              : "Consumo / Merma de cocina"),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSuccessToast(
          movementType === "IN_PURCHASE"
            ? `¡Compra de ${quantity} ${selectedItem.unit} a ${supplierFinalName} registrada en MongoDB!`
            : `¡Salida de stock registrada en base de datos!`
        );
        setTimeout(() => setSuccessToast(""), 4000);
        await loadData();
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

  const totalItemsCount = items.length;
  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;
  const totalValuation = items.reduce((acc, curr) => acc + curr.currentStock * curr.unitCostCOP, 0);

  // Total gastado / invertido en compras registradas
  const totalPurchasesCost = movements
    .filter((m) => m.movementType === "IN_PURCHASE" && m.totalCostCOP)
    .reduce((acc, curr) => acc + (curr.totalCostCOP || 0), 0);

  const purchaseMovements = movements.filter((m) => m.movementType === "IN_PURCHASE");

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
              Control de Inventario y Compras
            </h1>
            <p className="text-xs text-zinc-400">
              Insumos, compras a proveedores/tiendas y costos sincronizados en MongoDB Atlas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenMovementModal(undefined, "IN_PURCHASE")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            + Registrar Compra
          </button>
          <button
            onClick={() => handleOpenMovementModal(undefined, "OUT_WASTE")}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700 transition"
          >
            <Minus className="h-4 w-4 text-rose-400" />
            Salida / Merma
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400">Insumos Registrados</p>
            <p className="text-2xl font-black text-white">{totalItemsCount}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400">Stock Bajo / Crítico</p>
            <p className={`text-2xl font-black ${lowStockCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {lowStockCount} {lowStockCount === 1 ? "insumo" : "insumos"}
            </p>
          </div>
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"}`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400">Valoración Stock Actual</p>
            <p className="text-lg sm:text-xl font-black text-amber-400">{formatCOP(totalValuation)}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141414] border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400">Inversión en Compras</p>
            <p className="text-lg sm:text-xl font-black text-emerald-400">{formatCOP(totalPurchasesCost)}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Pestañas de Vista */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("stock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "stock"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-zinc-400 hover:text-white bg-[#141414] border border-zinc-800"
          }`}
        >
          <Package className="h-4 w-4" />
          Stock de Insumos ({items.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "history"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
              : "text-zinc-400 hover:text-white bg-[#141414] border border-zinc-800"
          }`}
        >
          <History className="h-4 w-4" />
          Historial de Compras e Inversión ({purchaseMovements.length})
        </button>
      </div>

      {/* VISTA 1: INSUMOS Y STOCK */}
      {activeTab === "stock" && (
        <div className="space-y-4">
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
                          {isLow ? "Crítico" : "Óptimo"}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/60 space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-zinc-400">Stock Actual:</span>
                          <span className="text-2xl font-black text-white">
                            {item.currentStock}{" "}
                            <span className="text-xs font-semibold text-zinc-400">{item.unit}</span>
                          </span>
                        </div>

                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isLow ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${healthPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                          <span>Mínimo: {item.minStock} {item.unit}</span>
                          <span>Costo Unit: <strong className="text-zinc-300">{formatCOP(item.unitCostCOP)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                      <button
                        onClick={() => handleOpenMovementModal(item, "IN_PURCHASE")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition"
                      >
                        <Plus className="h-3.5 w-3.5" /> + Entrada (Compra)
                      </button>
                      <button
                        onClick={() => handleOpenMovementModal(item, "OUT_WASTE")}
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
        </div>
      )}

      {/* VISTA 2: HISTORIAL DE COMPRAS E INVERSIONES */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#141414] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Store className="h-4 w-4 text-emerald-400" />
                  Registro Detallado de Compras e Inversión
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Control de qué se compró, en qué tienda o proveedor y dinero invertido
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                Total Invertido: {formatCOP(totalPurchasesCost)}
              </span>
            </div>

            {purchaseMovements.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Store className="h-8 w-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-400">
                  Aún no has registrado compras en el sistema.
                </p>
                <p className="text-[11px] text-zinc-500">
                  Usa el botón "+ Registrar Compra" para registrar compras a proveedores o tiendas locales.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/60 text-zinc-400 font-bold border-b border-zinc-800">
                    <tr>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Insumo</th>
                      <th className="p-3.5">Cantidad</th>
                      <th className="p-3.5">Proveedor / Tienda</th>
                      <th className="p-3.5">Costo Unit.</th>
                      <th className="p-3.5 text-right">Inversión Total</th>
                      <th className="p-3.5">Observación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {purchaseMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-900/40 transition">
                        <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5 font-bold text-white whitespace-nowrap">
                          {m.ingredientName}
                        </td>
                        <td className="p-3.5 text-emerald-400 font-mono font-bold">
                          +{Math.abs(m.quantity)}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-[11px]">
                            <Store className="h-3 w-3 text-amber-400" />
                            {m.supplierName || "Proveedor General"}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-400 font-mono">
                          {m.unitCostCOP ? formatCOP(m.unitCostCOP) : "—"}
                        </td>
                        <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                          {m.totalCostCOP ? formatCOP(m.totalCostCOP) : "—"}
                        </td>
                        <td className="p-3.5 text-zinc-400 italic text-[11px] max-w-xs truncate">
                          {m.reason || "Compra de insumo"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Registrar Compra / Movimiento */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden">
            {/* Cabecera modal */}
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-zinc-800 shrink-0">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-amber-500" />
                {movementType === "IN_PURCHASE" ? "Registrar Compra de Insumo" : "Registrar Salida / Merma"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <form onSubmit={handleSubmitMovement} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Tipo de Operación */}
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

              {/* Insumo a Modificar */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Insumo a Comprar / Modificar *</label>
                <select
                  value={selectedItem.id}
                  onChange={(e) => handleItemChange(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Stock actual: {i.currentStock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* DESPLEGABLE DE PROVEEDOR O TIENDA (SOLO EN COMPRAS) */}
              {movementType === "IN_PURCHASE" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5" />
                      ¿A qué Proveedor o Tienda se compró? *
                    </label>
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <optgroup label="Proveedores Registrados">
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} {s.supplyType ? `(${s.supplyType})` : ""}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label="Compras Locales / Tiendas">
                        <option value="🏪 Tienda de Barrio / Minimercado">🏪 Tienda de Barrio / Minimercado</option>
                        <option value="🛒 Supermercado (D1 / Ara / Éxito)">🛒 Supermercado (D1 / Ara / Éxito)</option>
                        <option value="🏬 Plaza de Mercado / Central de Abastos">🏬 Plaza de Mercado / Abastos</option>
                        <option value="🥩 Carnicería Local">🥩 Carnicería Local</option>
                        <option value="custom">➕ Otra Tienda / Proveedor (escribir nombre)...</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Campo si elige tienda personalizada */}
                  {selectedSupplier === "custom" && (
                    <div className="space-y-1 animate-in fade-in">
                      <label className="text-[11px] text-zinc-300 font-semibold">
                        Nombre específico de la tienda o vendedor:
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Carnicería Don Carlos, Tienda La Esquina..."
                        value={customSupplier}
                        onChange={(e) => setCustomSupplier(e.target.value)}
                        className="w-full bg-black/60 border border-amber-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Costos e Inversión */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-300 font-semibold">
                        Costo Unit. (COP)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unitCost || ""}
                        onChange={(e) => setUnitCost(Number(e.target.value))}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-300 font-semibold">
                        Inversión Total
                      </label>
                      <div className="h-8 flex items-center px-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 font-mono font-black text-xs">
                        {formatCOP(Math.round((quantity || 0) * (unitCost || 0)))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  Cantidad a ingresar ({selectedItem.unit}) *
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

              {/* Motivo o Factura */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">N° Factura / Nota / Observación</label>
                <input
                  type="text"
                  placeholder={movementType === "IN_PURCHASE" ? "Ej: Factura 0124 / Compra de urgencia" : "Ej: Merma de brasa / Preparación"}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Botón Guardar fijo */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition active:scale-98 disabled:opacity-50"
                >
                  {submitting
                    ? "Guardando en MongoDB Atlas..."
                    : movementType === "IN_PURCHASE"
                    ? `Confirmar Compra (${formatCOP(Math.round((quantity || 0) * (unitCost || 0)))})`
                    : "Confirmar Salida de Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
