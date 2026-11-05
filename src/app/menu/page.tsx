"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCOP } from "@/shared/money";
import {
  UtensilsCrossed,
  PlusCircle,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  FileImage,
  List,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface MenuItemDTO {
  _id: string;
  sku: string;
  name: string;
  category: "Individuales" | "Combos" | "Especiales";
  description: string;
  priceCOP: number;
  accompaniments: string;
  isAvailable?: boolean;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"catalog" | "editor" | "photo">("catalog");
  const [selectedCat, setSelectedCat] = useState<string>("Todos");

  // Formulario nuevo plato
  const [newSku, setNewSku] = useState("");
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<"Individuales" | "Combos" | "Especiales">("Individuales");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDesc, setEditDesc] = useState<string>("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/menu-items");
      const json = await res.json();
      if (json.data) {
        setItems(json.data);
      }
    } catch (err) {
      console.error("Error cargando menú:", err);
      toast.error("No se pudo cargar el menú desde la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku || !newName || !newPrice) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newSku.toUpperCase().trim(),
          name: newName.trim(),
          category: newCat,
          description: newDesc.trim(),
          priceCOP: Number(newPrice),
        }),
      });

      if (!res.ok) throw new Error("Fallo al guardar en base de datos");

      toast.success(`Plato ${newName} agregado a la base de datos!`);
      setNewSku("");
      setNewName("");
      setNewPrice("");
      setNewDesc("");
      fetchItems();
    } catch (err) {
      toast.error("Error guardando el plato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item: MenuItemDTO) => {
    const nextVal = item.isAvailable === false ? true : false;
    try {
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: nextVal } : i))
      );

      await fetch("/api/v1/menu-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, isAvailable: nextVal }),
      });

      toast.success(
        nextVal
          ? `${item.name} ahora está disponible.`
          : `${item.name} marcado como agotado.`
      );
    } catch (err) {
      toast.error("No se pudo actualizar el estado.");
    }
  };

  const handleSaveEdit = async (item: MenuItemDTO) => {
    try {
      await fetch("/api/v1/menu-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item._id,
          name: editName.trim() || item.name,
          priceCOP: editPrice,
          description: editDesc,
        }),
      });

      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id
            ? { ...i, name: editName.trim() || item.name, priceCOP: editPrice, description: editDesc }
            : i
        )
      );

      setEditingId(null);
      toast.success(`Plato ${editName || item.name} actualizado en base de datos.`);
    } catch (err) {
      toast.error("Error actualizando plato.");
    }
  };

  const handleDeleteMenuItem = async (item: MenuItemDTO) => {
    if (!confirm(`¿Eliminar el plato "${item.name}" de la carta y la base de datos?`)) return;
    try {
      const res = await fetch(`/api/v1/menu-items?id=${item._id || item.sku}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== item._id && i.sku !== item.sku));
        toast.success(`Plato ${item.name} eliminado.`);
      }
    } catch (err) {
      toast.error("Error al eliminar plato.");
    }
  };

  const filtered =
    selectedCat === "Todos"
      ? items
      : items.filter((i) => i.category === selectedCat);

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-5">
      {/* Encabezado y Selector de Vistas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-amber-500" />
            Gestión Dinámica del Menú
          </h1>
          <p className="text-xs text-zinc-400">
            Conectado en tiempo real a MongoDB Atlas
          </p>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "catalog"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <List className="h-4 w-4" /> Carta Activa ({items.length})
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "editor"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Edit3 className="h-4 w-4" /> Editor de Precios
          </button>

          <button
            onClick={() => setActiveTab("photo")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === "photo"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileImage className="h-4 w-4" /> Foto Original
          </button>
        </div>
      </div>

      {/* VISTA 1: CARTA ACTIVA PARA POS */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["Todos", "Individuales", "Combos", "Especiales"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCat === cat
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                    : "bg-[#171717] text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Aviso oficial */}
          <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Garantía de sabor:</strong> Todos los platos incluyen{" "}
              <em>papa, ensalada y salsa de la casa</em>.
            </span>
          </div>

          {/* Grilla */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <div
                key={item.sku}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  item.isAvailable === false
                    ? "border-zinc-800 bg-zinc-950/50 opacity-60"
                    : item.category === "Especiales"
                    ? "border-amber-500/60 bg-gradient-to-br from-[#291708] to-[#15100D]"
                    : "border-zinc-800 bg-[#171717]"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-amber-500 font-bold">
                      {item.sku}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.isAvailable === false && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Agotado
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold text-zinc-500">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mt-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-lg font-black text-amber-400">
                    {formatCOP(item.priceCOP)}
                  </span>

                  <Link
                    href="/pedidos/nuevo"
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Ordenar en POS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: EDITOR DINÁMICO DE MENÚ (ADMIN) */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario para agregar plato nuevo */}
          <div className="lg:col-span-1">
            <form
              onSubmit={handleCreateItem}
              className="bg-[#171717] border border-zinc-800 rounded-2xl p-5 space-y-3.5 shadow-xl sticky top-20"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                <PlusCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Agregar Plato a BD</h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Código / SKU *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BEB-001 o COM-004"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Nombre del Plato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Costillas BBQ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Categoría</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Individuales">Individuales</option>
                    <option value="Combos">Combos</option>
                    <option value="Especiales">Especiales</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Precio (COP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="18000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Descripción / Porción</label>
                <textarea
                  rows={2}
                  placeholder="Ej: 300 g costilla bañada en salsa..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:brightness-110 transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando en BD..." : "+ Guardar Plato en Carta"}
              </button>
            </form>
          </div>

          {/* Lista de platos editables */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Platos Activos en Base de Datos ({items.length})
            </h3>

            {items.map((item) => {
              const isEditing = editingId === item._id;

              return (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl border border-zinc-800 bg-[#171717] space-y-3 shadow-sm hover:border-zinc-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {item.sku}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.name}</h4>
                      <span className="text-[10px] text-zinc-400 uppercase">
                        ({item.category})
                      </span>
                    </div>

                    {/* Toggle Disponibilidad en vivo */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition ${
                        item.isAvailable !== false
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {item.isAvailable !== false ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Disponible
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5" /> Agotado
                        </>
                      )}
                    </button>
                  </div>

                  {/* Edición o Vista */}
                  {isEditing ? (
                    <div className="space-y-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-700">
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] text-zinc-400 font-semibold">Nombre del Plato</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-zinc-400 font-semibold">Precio (COP)</label>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(Number(e.target.value))}
                              className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 font-semibold">Descripción / Porción</label>
                            <input
                              type="text"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full bg-black/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteMenuItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar Plato
                        </button>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-400"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1"
                          >
                            <Save className="h-3.5 w-3.5" /> Guardar en BD
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <p className="text-zinc-400 text-[11px]">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-400 mr-1">
                          {formatCOP(item.priceCOP)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(item._id);
                            setEditName(item.name);
                            setEditPrice(item.priceCOP);
                            setEditDesc(item.description);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          title="Editar plato"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="Eliminar plato"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 3: FOTO ORIGINAL */}
      {activeTab === "photo" && (
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl p-2 text-center space-y-2">
          <p className="text-xs text-zinc-400 py-1">
            Menú fotográfico original suministrado para <strong>La Parrilla de Sore</strong>
          </p>
          <div className="relative rounded-xl overflow-hidden border border-zinc-800">
            <img
              src="/brand/menu-oficial.jpg"
              alt="Menú Parrilla y Sabor La Parrilla de Sore"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
