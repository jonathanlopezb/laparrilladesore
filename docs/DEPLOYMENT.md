# DEPLOYMENT.md — Guía de Despliegue en Vercel y MongoDB Atlas

**La Parrilla de Sore** — Especificación de infraestructura y puesta en producción.

## 1. Requisitos de Plataforma

- **Hosting:** Vercel (Plan Pro recomendado para operaciones comerciales).
- **Runtime:** Node.js 20.x o 22.x LTS para Vercel Functions (Node.js runtime requerido por el driver nativo de MongoDB).
- **Base de datos:** MongoDB Atlas (M0 Free para desarrollo/staging; clúster dedicado o Flex M10+ con soporte de réplicas y transacciones para producción).
- **Región:** Co-ubicación recomendada (Vercel `iad1` o `gru1` y Atlas AWS `us-east-1` o `sa-east-1` según latencia para Colombia).

## 2. Variables de Entorno Requeridas en Vercel

Configurar en el panel de Vercel (Settings → Environment Variables):

| Variable | Descripción | Entornos |
|---|---|---|
| `MONGODB_URI` | Cadena de conexión de MongoDB Atlas con usuario y contraseña | Production / Preview / Development |
| `MONGODB_DB` | Nombre de la base de datos (ej. `parrilla_sore_prod`) | Production / Preview / Development |
| `BETTER_AUTH_SECRET` | Clave secreta criptográfica (32 bytes base64) | Production / Preview / Development |
| `BETTER_AUTH_URL` | URL canónica de la aplicación (ej. `https://laparrilladesore.vercel.app`) | Production / Preview |
| `NEXT_PUBLIC_APP_URL` | URL pública base expuesta al cliente | Production / Preview / Development |
| `NODE_ENV` | Modo de ejecución (`production`) | Production |

## 3. Comandos de Pipeline en Vercel

- **Build Command:** `next build`
- **Install Command:** `npm install --legacy-peer-deps`
- **Output Directory:** `.next`
