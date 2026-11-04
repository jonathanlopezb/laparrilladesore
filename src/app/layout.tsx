import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | La Parrilla de Sore",
    default: "La Parrilla de Sore · Sabor que une",
  },
  description: "ERP ligero + CRM + POS gastronómico mobile-first para La Parrilla de Sore",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Parrilla de Sore",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="bg-[#0C0C0C] text-zinc-100 antialiased selection:bg-amber-500/30">
        <AppShell>{children}</AppShell>
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
