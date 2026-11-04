"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { OFFICIAL_MENU, MENU_CATEGORIES } from "@/shared/menu/catalog";
import { formatCOP } from "@/shared/money";
import {
  UtensilsCrossed,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Flame,
  FileImage,
  List,
} from "lucide-react";

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<"cards" | "original">("cards");
  const [selectedCat, setSelectedCat] = useState<string>("Todos");

  const filtered =
    selectedCat === "Todos"
      ? OFFICIAL_MENU
      : OFFICIAL_MENU.filter((m) => m.category === selectedCat);

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
              <UtensilsCrossed className="h-4 w-4 text-amber-500" />
              Menú Oficial
            </h1>
            <p className="text-[11px] text-zinc-400">
              La Parrilla de Sore · Parrilla y Sabor
            </p>
          </div>
        </div>

        {/* Selector de Vista */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === "cards"
                ? "bg-amber-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Platos
          </button>
          <button
            onClick={() => setActiveTab("original")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition ${
              activeTab === "original"
                ? "bg-amber-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileImage className="h-3.5 w-3.5" /> Carta Original
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        {activeTab === "cards" ? (
          <>
            {/* Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {MENU_CATEGORIES.map((cat) => (
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

            {/* Grilla de Platos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.sku}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    item.isSpecial
                      ? "border-amber-500/60 bg-gradient-to-br from-[#291708] to-[#15100D]"
                      : "border-zinc-800 bg-[#171717]"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-amber-500 font-bold">
                        {item.sku}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500">
                        {item.category}
                      </span>
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
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Ordenar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl p-2 text-center space-y-2">
            <p className="text-xs text-zinc-400 py-1">
              Menú fotográfico oficial de <strong>La Parrilla de Sore</strong>
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
      </main>
    </div>
  );
}
