import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Lock, Mail, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciar Sesión | La Parrilla de Sore",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F0F0F] text-zinc-100 p-4">
      <div className="w-full max-w-sm space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-500 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/25">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            La Parrilla de Sore
          </h1>
          <p className="text-xs text-amber-500 font-semibold tracking-wider uppercase">
            Acceso administrativo y operativo
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-2xl border border-zinc-800 bg-[#171717] p-6 shadow-xl space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                placeholder="admin@laparrilladesore.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.99] transition"
          >
            Ingresar al Sistema
          </button>

          <p className="text-center text-[11px] text-zinc-500 pt-1">
            Solo personal autorizado · La Parrilla de Sore
          </p>
        </div>
      </div>
    </main>
  );
}
