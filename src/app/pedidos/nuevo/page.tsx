"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  OFFICIAL_MENU,
  MENU_CATEGORIES,
  type MenuItem,
} from "@/shared/menu/catalog";
import {
  usePosStore,
  type OrderChannel,
  type PaymentMethod,
  type OrderRecord,
} from "@/modules/orders/pos-store";
import { formatCOP } from "@/shared/money";
import {
  Flame,
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  User,
  MapPin,
  Utensils,
  CreditCard,
  Printer,
  CheckCircle2,
  Sparkles,
  Phone,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function PosNuevoPedidoPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(OFFICIAL_MENU);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastCommittedOrder, setLastCommittedOrder] = useState<OrderRecord | null>(null);
  const [isNewCustomerModal, setIsNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");

  const {
    cart,
    channel,
    tableNumber,
    customer,
    paymentMethod,
    amountReceivedCOP,
    creditDebtorName,
    creditAuthorizedBy,
    orderNotes,
    customersList,
    addItem,
    updateQuantity,
    updateNotes,
    setChannel,
    setTableNumber,
    setCustomer,
    setPaymentMethod,
    setAmountReceived,
    setCreditInfo,
    setOrderNotes,
    clearCart,
    submitOrder,
    fetchOrders,
    addCustomer,
  } = usePosStore();

  // Cargar catálogo y pedidos en vivo desde MongoDB
  useEffect(() => {
    fetchOrders();
    fetch("/api/v1/menu-items")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data?.length > 0) {
          setMenuItems(d.data);
        }
      })
      .catch((e) => console.log("Usando menú local:", e));
  }, [fetchOrders]);

  const cartTotal = cart.reduce((acc, i) => acc + i.subtotalCOP, 0);
  const cartItemCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const changeCOP = Math.max(0, (amountReceivedCOP || cartTotal) - cartTotal);

  const filteredMenu =
    selectedCategory === "Todos"
      ? menuItems
      : menuItems.filter((m) => m.category === selectedCategory);

  const handleFinishOrder = async () => {
    if (paymentMethod === "credit") {
      const debtor = (creditDebtorName || customer.name).trim();
      if (!debtor || debtor === "Cliente General") {
        toast.error("Para ventas a crédito, debes ingresar el nombre del deudor.");
        return;
      }
      if (!creditAuthorizedBy.trim()) {
        toast.error("Debes especificar quién autorizó el crédito.");
        return;
      }
    }

    const order = submitOrder();
    if (order) {
      setLastCommittedOrder(order);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);

      // Persistir orden en MongoDB Atlas a través de la API
      try {
        await fetch("/api/v1/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        await fetchOrders();
      } catch (err) {
        console.warn("Orden guardada localmente:", err);
      }
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
    });
    setNewCustName("");
    setNewCustPhone("");
    setNewCustAddress("");
    setIsNewCustomerModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-zinc-100 pb-28 md:pb-8">
      {/* Top Bar */}
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
              <Flame className="h-4 w-4 text-amber-500" />
              Nuevo Pedido (POS)
            </h1>
            <p className="text-[11px] text-zinc-400">
              La Parrilla de Sore · Sede Principal
            </p>
          </div>
        </div>

        {/* Canales de Venta */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          {(
            [
              { id: "counter", label: "Mostrador" },
              { id: "takeaway", label: "Llevar" },
              { id: "table", label: "Mesa" },
              { id: "delivery", label: "Domicilio" },
            ] as const
          ).map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                channel === ch.id
                  ? "bg-amber-600 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </header>

      {/* Selector de Cliente y Mesa / Domicilio */}
      <div className="bg-[#171717] border-b border-zinc-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <User className="h-4 w-4 text-amber-500 shrink-0" />
            <select
              value={customer.name}
              onChange={(e) => {
                const found = customersList.find((c) => c.name === e.target.value);
                if (found) setCustomer(found);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              {customersList.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsNewCustomerModal(true)}
              className="text-[11px] font-semibold text-amber-400 hover:underline"
            >
              + Nuevo Cliente
            </button>
          </div>

          {channel === "table" && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Mesa N°:</span>
              <input
                type="text"
                placeholder="Ej: 4"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-center font-bold text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {channel === "delivery" && customer.address && (
            <div className="flex items-center gap-1.5 text-zinc-300">
              <MapPin className="h-3.5 w-3.5 text-orange-400" />
              <span>{customer.address}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catálogo de Productos (2 columnas en desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                    : "bg-[#1C1C1C] text-zinc-400 border border-zinc-800 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Banner de acompañamientos */}
          <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-2.5 px-3 flex items-center justify-between text-xs text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Nota del restaurante:</strong> Todos los platos incluyen{" "}
                <em>papa, ensalada y salsa de la casa</em>.
              </span>
            </span>
          </div>

          {/* Grilla de los 7 platos oficiales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMenu.map((item) => {
              const inCart = cart.find((c) => c.sku === item.sku);

              return (
                <div
                  key={item.sku}
                  className={`relative p-4 rounded-2xl border transition flex flex-col justify-between ${
                    item.isSpecial
                      ? "border-amber-500/50 bg-gradient-to-br from-[#231709] to-[#17120F]"
                      : "border-zinc-800/80 bg-[#171717] hover:border-zinc-700"
                  }`}
                >
                  {item.isSpecial && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                      ★ Especial
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-500 font-bold">
                        {item.sku}
                      </span>
                      <span className="text-[11px] text-zinc-500 uppercase font-semibold">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                    <span className="text-lg font-black text-amber-400">
                      {formatCOP(item.priceCOP)}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-2 bg-zinc-900 rounded-xl p-1 border border-amber-500/30">
                        <button
                          onClick={() => updateQuantity(item.sku, -1)}
                          className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-white">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, 1)}
                          className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center text-white hover:bg-amber-500"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(item)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel lateral del Carrito (Visible en desktop / modal en móvil) */}
        <div className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-zinc-800 bg-[#171717] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-white text-base">Comanda Actual</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Vaciar
                </button>
              )}
            </div>

            {/* Lista de platos en el carrito */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 space-y-2">
                  <Utensils className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs">No hay productos en la comanda.</p>
                  <p className="text-[11px] text-zinc-600">
                    Toca "Agregar" en cualquier plato del menú.
                  </p>
                </div>
              ) : (
                cart.map((line) => (
                  <div
                    key={line.sku}
                    className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">
                          {line.name}
                        </h4>
                        <span className="text-[11px] text-zinc-400">
                          {formatCOP(line.unitPriceCOP)} c/u
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-white">
                        {formatCOP(line.subtotalCOP)}
                      </span>
                    </div>

                    {/* Notas del plato */}
                    <input
                      type="text"
                      placeholder="Nota (ej: chuleta bien asada...)"
                      value={line.notes || ""}
                      onChange={(e) => updateNotes(line.sku, e.target.value)}
                      className="w-full text-[11px] bg-black/40 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                    />

                    {/* Controles cantidad */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(line.sku, -1)}
                          className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(line.sku, 1)}
                          className="h-6 w-6 rounded bg-amber-600 flex items-center justify-center text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-[11px] text-zinc-500">
                        {line.quantity} x {line.name}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total y Cobro */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400 font-medium">Subtotal</span>
                  <span className="text-sm font-bold text-zinc-200">
                    {formatCOP(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total a Cobrar</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatCOP(cartTotal)}
                  </span>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-extrabold text-sm text-white shadow-xl shadow-orange-500/20 hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Cobrar Pedido ({formatCOP(cartTotal)})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra Flotante Móvil del Carrito (Mobile-First 360-390px) */}
      {cart.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-40 lg:hidden p-3 bg-gradient-to-t from-black via-black/90 to-transparent">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold flex items-center justify-between shadow-2xl shadow-orange-500/40 active:scale-98 transition"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-black/30 items-center justify-center text-xs font-extrabold">
                {cartItemCount}
              </span>
              <span className="text-sm">Ver Comanda</span>
            </div>
            <span className="text-base font-black">{formatCOP(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Modal / Bottom Sheet Móvil del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#171717] border-t border-zinc-800 rounded-t-3xl max-h-[85vh] flex flex-col p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-white text-base">Comanda Actual</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Platos */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {cart.map((line) => (
                <div
                  key={line.sku}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{line.name}</h4>
                      <span className="text-[11px] text-zinc-400">
                        {formatCOP(line.unitPriceCOP)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {formatCOP(line.subtotalCOP)}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Instrucción de cocina..."
                    value={line.notes || ""}
                    onChange={(e) => updateNotes(line.sku, e.target.value)}
                    className="w-full text-[11px] bg-black/40 border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(line.sku, -1)}
                        className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-white w-6 text-center">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(line.sku, 1)}
                        className="h-7 w-7 rounded-lg bg-amber-600 flex items-center justify-center text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => updateQuantity(line.sku, -line.quantity)}
                      className="text-xs text-rose-400"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total y botón cobrar */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Total</span>
                <span className="text-2xl font-black text-amber-400">
                  {formatCOP(cartTotal)}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-sm text-white"
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cobro / Checkout */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 sm:duration-150">
            {/* Cabecera fija */}
            <div className="flex items-center justify-between p-4 sm:p-5 pb-3 border-b border-zinc-800 shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                Registrar Pago y Confirmar
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido con Scroll para móviles */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Resumen */}
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-zinc-400">Cliente</span>
                  <p className="text-sm font-bold text-white">{customer.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400">Monto Total</span>
                  <p className="text-xl font-black text-amber-400">
                    {formatCOP(cartTotal)}
                  </p>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Método de Pago
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "cash", label: "💵 Efectivo" },
                      { id: "nequi", label: "🟣 Nequi" },
                      { id: "daviplata", label: "🔴 Daviplata" },
                      { id: "breb", label: "⚡ Bre-B" },
                      { id: "credit", label: "📋 Crédito (Fiado)" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(m.id);
                        if (m.id === "credit" && !creditDebtorName && customer.name !== "Cliente General") {
                          setCreditInfo(customer.name, creditAuthorizedBy || "Jonathan");
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition ${
                        paymentMethod === m.id
                          ? "bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-600/30"
                          : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                      } ${m.id === "credit" ? "sm:col-span-2" : ""}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Si es crédito: Nombre del deudor y quién autorizó */}
              {paymentMethod === "credit" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60 animate-in fade-in">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>Venta a Crédito / Fiado (Cuenta por cobrar)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold">
                      Nombre del Deudor / Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre completo a quien se le fía"
                      value={creditDebtorName || (customer.name !== "Cliente General" ? customer.name : "")}
                      onChange={(e) => setCreditInfo(e.target.value, creditAuthorizedBy || "Jonathan")}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold">
                      ¿Quién autorizó el crédito? *
                    </label>
                    <select
                      value={creditAuthorizedBy || "Jonathan"}
                      onChange={(e) => setCreditInfo(creditDebtorName || customer.name, e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Jonathan">Jonathan</option>
                      <option value="Sore">Sore</option>
                    </select>
                  </div>

                  <p className="text-[11px] text-amber-300/80">
                    Esta orden se guardará con saldo pendiente y la autorización seleccionada.
                  </p>
                </div>
              )}

              {/* Si es efectivo: Valor recibido y cambio */}
              {paymentMethod === "cash" && (
                <div className="space-y-3 p-3 rounded-xl bg-black/40 border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300">
                      Efectivo Recibido (COP)
                    </label>
                    <input
                      type="number"
                      placeholder={`Ej: ${cartTotal}`}
                      value={amountReceivedCOP || ""}
                      onChange={(e) => setAmountReceived(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Vueltos / Cambio:</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {formatCOP(changeCOP)}
                    </span>
                  </div>
                </div>
              )}

              {/* Si es Bre-B, Nequi o Daviplata */}
              {(paymentMethod === "nequi" || paymentMethod === "daviplata" || paymentMethod === "breb") && (
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                  <span>Transferencia {paymentMethod.toUpperCase()}:</span>
                  <span className="font-extrabold text-amber-400">{formatCOP(cartTotal)}</span>
                </div>
              )}

              {/* Observaciones generales */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Notas del Pedido</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de empaque, entrega, etc."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Botón inferior fijo */}
            <div className="p-4 border-t border-zinc-800 bg-[#141414] shrink-0">
              <button
                onClick={handleFinishOrder}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:brightness-110 transition active:scale-98"
              >
                ✓ Confirmar e Imprimir Comanda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ticket / Comanda Emitida */}
      {lastCommittedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-1 pb-3 border-b border-zinc-800">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">¡Pedido Confirmado!</h3>
              <p className="text-xs text-amber-500 font-mono font-bold">
                {lastCommittedOrder.orderNumber}
              </p>
            </div>

            {/* Ticket Térmico Simulado */}
            <div className="bg-white text-black p-4 rounded-xl font-mono text-xs space-y-2 shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-zinc-400">
                <p className="font-extrabold text-sm">LA PARRILLA DE SORE</p>
                <p className="text-[10px]">SABOR QUE UNE</p>
                <p className="text-[10px] mt-1">Ticket de Venta #{lastCommittedOrder.orderNumber}</p>
                <p className="text-[10px] text-zinc-600">{lastCommittedOrder.createdAt}</p>
              </div>

              <div className="py-1 border-b border-dashed border-zinc-400 text-[11px] space-y-0.5">
                <p><strong>Cliente:</strong> {lastCommittedOrder.customer.name}</p>
                <p><strong>Canal:</strong> {lastCommittedOrder.channel.toUpperCase()}</p>
                {lastCommittedOrder.tableNumber && (
                  <p><strong>Mesa:</strong> {lastCommittedOrder.tableNumber}</p>
                )}
                {lastCommittedOrder.deliveryAddress && (
                  <p><strong>Dir:</strong> {lastCommittedOrder.deliveryAddress}</p>
                )}
              </div>

              <div className="py-2 border-b border-dashed border-zinc-400 space-y-1">
                {lastCommittedOrder.lines.map((l) => (
                  <div key={l.sku} className="flex justify-between">
                    <div>
                      <span>{l.quantity}x {l.name}</span>
                      {l.notes && <p className="text-[9px] text-zinc-600 italic">*{l.notes}</p>}
                    </div>
                    <span className="font-bold">{formatCOP(l.subtotalCOP)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-right space-y-0.5">
                <p className="text-sm font-extrabold">TOTAL: {formatCOP(lastCommittedOrder.totalCOP)}</p>
                <p className="text-[10px] font-bold">
                  Pago:{" "}
                  {lastCommittedOrder.paymentMethod === "credit"
                    ? "CRÉDITO (PENDIENTE)"
                    : lastCommittedOrder.paymentMethod.toUpperCase()}
                </p>
                {lastCommittedOrder.paymentMethod === "credit" && (
                  <>
                    <p className="text-[10px] text-zinc-700">
                      Deudor: {lastCommittedOrder.creditDebtorName || lastCommittedOrder.customer.name}
                    </p>
                    <p className="text-[10px] text-zinc-700">
                      Autorizó: {lastCommittedOrder.creditAuthorizedBy || "Administrador"}
                    </p>
                  </>
                )}
                {lastCommittedOrder.changeCOP > 0 && (
                  <p className="text-[10px]">Vueltos: {formatCOP(lastCommittedOrder.changeCOP)}</p>
                )}
              </div>

              <p className="text-center text-[9px] pt-2 text-zinc-600">
                Todos los platos incluyen papa, ensalada y salsa de la casa.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Imprimir
              </button>
              <button
                onClick={() => setLastCommittedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                Listo / Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rápido: Nuevo Cliente CRM */}
      {isNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-[#171717] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <User className="h-4 w-4 text-amber-500" />
                Registrar Cliente Rápido
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModal(false)}
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
                placeholder="Ej: Laura Martínez"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Teléfono / WhatsApp</label>
              <input
                type="tel"
                placeholder="300 000 0000"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Dirección Domicilio</label>
              <input
                type="text"
                placeholder="Barrio, calle y número..."
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Guardar y Seleccionar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
