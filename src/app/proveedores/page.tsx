"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Save,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import type { SupplierItem } from "@/server/modules/suppliers/suppliers.service";

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    taxId: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    supplyType: "Carnes y Pollo",
    paymentTermsDays: 0,
    notes: "",
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/suppliers");
      const data = await res.json();
      if (data.data) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const res = await fetch("/api/v1/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          name: "",
          taxId: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          supplyType: "Carnes y Pollo",
          paymentTermsDays: 0,
          notes: "",
        });
        setSuccessToast("¡Proveedor guardado en la base de datos con éxito!");
        setTimeout(() => setSuccessToast(""), 3500);
        await loadSuppliers();
      }
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Deseas dar de baja al proveedor "${name}"?`)) return;

    try {
      const res = await fetch(`/api/v1/suppliers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error eliminando proveedor:", err);
    }
  };

  const handleStartEdit = (s: SupplierItem) => {
    setEditingSupplier(s);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;

    try {
      setSaving(true);
      const res = await fetch("/api/v1/suppliers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSupplier),
      });

      if (res.ok) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplier.id ? editingSupplier : s))
        );
        setEditingSupplier(null);
        setSuccessToast(`¡Proveedor ${editingSupplier.name} actualizado en base de datos!`);
        setTimeout(() => setSuccessToast(""), 3500);
      }
    } catch (err) {
      console.error("Error actualizando proveedor:", err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactName && s.contactName.toLowerCase().includes(search.toLowerCase())) ||
      (s.supplyType && s.supplyType.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast de confirmación */}
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top duration-300">
          <CheckCircle2 className="h-5 w-5" />
          {successToast}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Proveedores e Insumos
              </h1>
              <p className="text-xs text-zinc-400">
                Directorio oficial de compras, pedidos y abastecimiento de la parrilla
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Barra de búsqueda y métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o tipo de insumo (pollo, carbón, papas)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="bg-[#141414] border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Total Proveedores Activos:</span>
          <span className="font-black text-amber-400 text-sm">{suppliers.length}</span>
        </div>
      </div>

      {/* Lista de Proveedores */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Cargando directorio de proveedores desde MongoDB...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#141414] border border-zinc-800 text-center space-y-3">
          <Truck className="h-10 w-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-zinc-300">No se encontraron proveedores</p>
          <p className="text-xs text-zinc-500">
            {search ? "Intenta con otro término de búsqueda" : "Crea tu primer proveedor haciendo clic en 'Nuevo Proveedor'"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-[#141414] border border-zinc-800/80 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-lg group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                      {s.supplyType}
                    </span>
                    <h3 className="font-extrabold text-white text-base mt-1.5 group-hover:text-amber-400 transition">
                      {s.name}
                    </h3>
                    {s.taxId && <p className="text-[11px] text-zinc-500 font-mono">NIT/CC: {s.taxId}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(s)}
                      className="text-zinc-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Editar proveedor"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-zinc-600 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Dar de baja proveedor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 pt-1">
                  {s.contactName && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-medium">Contacto:</span>
                      <span className="font-semibold text-white">{s.contactName}</span>
                    </div>
                  )}

                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <a
                        href={`tel:${s.phone}`}
                        className="hover:text-emerald-400 underline font-mono text-zinc-300"
                      >
                        {s.phone}
                      </a>
                    </div>
                  )}

                  {s.address && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{s.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span>
                      Crédito:{" "}
                      <strong className="text-zinc-200">
                        {s.paymentTermsDays === 0 ? "Contado" : `${s.paymentTermsDays} días`}
                      </strong>
                    </span>
                  </div>

                  {s.notes && (
                    <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400 italic">
                      "{s.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Contacto Rápido */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                {s.phone ? (
                  <>
                    <a
                      href={`https://wa.me/57${s.phone.replace(/\D/g, "")}?text=Hola%20${encodeURIComponent(
                        s.contactName || s.name
                      )},%20te%20escribimos%20de%20La%20Parrilla%20de%20Sore%20para%20un%20pedido.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a
                      href={`tel:${s.phone}`}
                      className="flex items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </>
                ) : (
                  <span className="text-[11px] text-zinc-500 italic">Sin teléfono registrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Proveedor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 shrink-0">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-500" />
                Registrar Nuevo Proveedor
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Razón Social o Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Distribuidora de Carnes del Oriente"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">NIT / Identificación</label>
                  <input
                    type="text"
                    placeholder="Ej: 901.234.567-8"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Tipo de Insumo</label>
                  <select
                    value={formData.supplyType}
                    onChange={(e) => setFormData({ ...formData, supplyType: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Carnes y Pollo">🍗 Carnes y Pollo</option>
                    <option value="Papas y Verduras">🥔 Papas y Verduras</option>
                    <option value="Bebidas y Refrescos">🥤 Bebidas y Refrescos</option>
                    <option value="Carbón y Fuego">🔥 Carbón y Fuego</option>
                    <option value="Empaques y Desechables">📦 Empaques y Desechables</option>
                    <option value="Salsas y Condimentos">🧂 Salsas y Condimentos</option>
                    <option value="Servicios y Mantenimiento">🛠️ Servicios y Mantenimiento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Nombre de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: Don Pedro Gómez"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Ej: 3101234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Dirección / Bodega</label>
                  <input
                    type="text"
                    placeholder="Ej: Abastos Bodega 4"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Plazo de Pago (Días)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 = Contado"
                    value={formData.paymentTermsDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Notas u Horario de Despacho</label>
                <textarea
                  rows={2}
                  placeholder="Días de entrega, requisitos, pedidos mínimos..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 transition active:scale-98 disabled:opacity-50"
                >
                  {saving ? "Guardando en MongoDB Atlas..." : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Proveedor */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 shrink-0">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-500" />
                Editar Proveedor: {editingSupplier.name}
              </h3>
              <button
                onClick={() => setEditingSupplier(null)}
                className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Razón Social o Empresa *</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">NIT o Cédula</label>
                  <input
                    type="text"
                    value={editingSupplier.taxId || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, taxId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Tipo de Suministro</label>
                  <input
                    type="text"
                    value={editingSupplier.supplyType}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, supplyType: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Persona de Contacto</label>
                  <input
                    type="text"
                    value={editingSupplier.contactName || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, contactName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    value={editingSupplier.phone || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Dirección / Bodega</label>
                  <input
                    type="text"
                    value={editingSupplier.address || ""}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">Plazo de Pago (Días)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSupplier.paymentTermsDays || 0}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, paymentTermsDays: Number(e.target.value) })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Notas u Horario de Despacho</label>
                <textarea
                  rows={2}
                  value={editingSupplier.notes || ""}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, notes: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando..." : "Actualizar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
