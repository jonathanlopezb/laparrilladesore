/**
 * src/app/page.tsx — Raíz: redirige a login
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/login");
}
