"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function ClientesPage() {
  const { customersList, addCustomer, orders } = usePosStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const filteredCustomers = customersList.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCustomer({ name: name.trim(), phone: phone.trim(), address: address.trim() });
    setName("");
    setPhone("");
    setAddress("");
    setIsModalOpen(false);
  };

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
              Directorio y frecuencia de pedidos
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Agregar Cliente</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171717] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredCustomers.map((cust, idx) => {
            const customerOrders = orders.filter((o) => o.customer.name === cust.name);

            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800 bg-[#171717] p-4 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{cust.name}</h3>
                    {cust.phone && (
                      <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-amber-500" />
                        {cust.phone}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {customerOrders.length} pedido(s)
                  </span>
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
      </main>

      {/* Modal Crear Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-amber-500" />
                Registrar Nuevo Cliente
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
                placeholder="Ej: Sofía Ramírez"
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Dirección para Entregas</label>
              <input
                type="text"
                placeholder="Calle, carrera o barrio..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Guardar Cliente
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
