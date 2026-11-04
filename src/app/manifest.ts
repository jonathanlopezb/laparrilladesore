/**
 * src/app/manifest.ts — PWA Web App Manifest
 */
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Parrilla de Sore",
    short_name: "Parrilla Sore",
    description: "Sistema de gestión de restaurante",
    start_url: "/",
    display: "standalone",
    background_color: "#0C0C0C",
    theme_color: "#D97706",
    orientation: "portrait-primary",
    categories: ["business", "food"],
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
