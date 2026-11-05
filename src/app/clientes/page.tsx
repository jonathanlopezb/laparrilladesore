"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePosStore, type CustomerSummary } from "@/modules/orders/pos-store";
import {
  Users,
  ArrowLeft,
  UserPlus,
  Phone,
  MapPin,
  Search,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerItem extends CustomerSummary {
  _id?: string;
  notes?: string;
}

export default function ClientesPage() {
  const { orders, addCustomer } = usePosStore();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal Editar
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/customers");
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        const mapped = data.data.map((c: any) => ({
          _id: c._id,
          name: c.name,
          phone: c.phone || "",
          address: c.notes || c.address || "",
        }));
        setCustomers(mapped);
      }
    } catch (err) {
      console.warn("Error cargando clientes de MongoDB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const newCust = { name: name.trim(), phone: phone.trim(), address: address.trim() };
      const res = await fetch("/api/v1/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      });
      const data = await res.json();

      const createdItem: CustomerItem = {
        _id: data.data?._id || `cust-${Date.now()}`,
        ...newCust,
      };

      setCustomers((prev) => [createdItem, ...prev]);
      addCustomer(newCust);
      toast.success(`Cliente ${name} guardado en base de datos`);

      setName("");
      setPhone("");
      setAddress("");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Error al guardar cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (c: CustomerItem) => {
    setEditingCustomer(c);
    setEditName(c.name);
    setEditPhone(c.phone || "");
    setEditAddress(c.address || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim()) return;

    try {
      setSaving(true);
      await fetch("/api/v1/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCustomer._id,
          name: editName.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
        }),
      });

      setCustomers((prev) =>
        prev.map((c) =>
          c._id === editingCustomer._id
            ? { ...c, name: editName.trim(), phone: editPhone.trim(), address: editAddress.trim() }
            : c
        )
      );

      toast.success(`Datos de ${editName} actualizados`);
      setEditingCustomer(null);
    } catch (err) {
      toast.error("Error al actualizar cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: CustomerItem) => {
    if (!confirm(`¿Eliminar al cliente "${c.name}" de la base de datos?`)) return;

    try {
      if (c._id) {
        await fetch(`/api/v1/customers?id=${c._id}`, { method: "DELETE" });
      }
      setCustomers((prev) => prev.filter((item) => item._id !== c._id && item.name !== c.name));
      toast.success(`Cliente ${c.name} eliminado`);
    } catch (err) {
      toast.error("Error al eliminar cliente");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 pb-20">
      {/* Header */}
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
              <Users className="h-4 w-4 text-amber-500" />
              CRM de Clientes
            </h1>
            <p className="text-[11px] text-zinc-400">
              Directorio sincronizado en tiempo real con MongoDB Atlas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 active:scale-95 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>+ Agregar Cliente</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, celular o dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171717] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Resumen */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>Total Clientes: <strong className="text-white">{customers.length}</strong></span>
          <span>Mostrando: <strong className="text-amber-400">{filteredCustomers.length}</strong></span>
        </div>

        {/* Lista de Clientes */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500">Cargando clientes desde MongoDB...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#171717] border border-zinc-800 text-center space-y-2">
            <Users className="h-8 w-8 text-zinc-600 mx-auto" />
            <p className="text-xs font-semibold text-zinc-300">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCustomers.map((cust, idx) => {
              const customerOrders = orders.filter((o) => o.customer.name === cust.name);

              return (
                <div
                  key={cust._id || idx}
                  className="rounded-2xl border border-zinc-800 bg-[#171717] p-4 space-y-3 shadow-md hover:border-zinc-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{cust.name}</h3>
                      {cust.phone ? (
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="h-3 w-3 text-amber-500" />
                          {cust.phone}
                        </p>
                      ) : (
                        <p className="text-[11px] text-zinc-600 italic">Sin teléfono registrado</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cust)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Editar cliente"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cust)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {cust.address && (
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-orange-400 shrink-0" />
                      <span>{cust.address}</span>
                    </p>
                  )}

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <Link
                      href={`/pedidos/nuevo`}
                      className="text-amber-500 font-bold hover:underline flex items-center gap-1"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Crear Pedido
                    </Link>

                    {cust.phone && (
                      <a
                        href={`https://wa.me/57${cust.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Crear Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-amber-500" />
                Nuevo Cliente
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Nombre Completo *</label>
              <input
                type="text"
                required
                placeholder="Ej: Carolina Gómez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Teléfono / WhatsApp</label>
              <input
                type="tel"
                placeholder="Ej: 310 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Dirección para Domicilios</label>
              <input
                type="text"
                placeholder="Barrio, calle y número..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 active:scale-98 transition disabled:opacity-50"
            >
              {saving ? "Guardando en MongoDB..." : "Guardar Cliente"}
            </button>
          </form>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-500" />
                Editar Cliente
              </h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Nombre Completo *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Dirección para Domicilios</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
