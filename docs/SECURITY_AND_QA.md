# SECURITY_AND_QA.md — Políticas de Seguridad, Permisos y Calidad

**La Parrilla de Sore** — Reglas de protección de datos, control de acceso y testing.

## 1. Principios de Seguridad

1. **Defensa en profundidad en el servidor:** Ninguna decisión de autorización o validación reside en el cliente. Ocultar botones en la interfaz de React es únicamente un detalle de UX; los Route Handlers y Server Actions deben verificar sesión, rol y branch idénticamente.
2. **Sin fuga de credenciales:** Prohibido el prefijo `NEXT_PUBLIC_` en variables que contengan tokens, conexiones a base de datos (`MONGODB_URI`) o secretos criptográficos (`BETTER_AUTH_SECRET`, `CRON_SECRET`).
3. **Driver MongoDB restringido:** Importar siempre `server-only` en cualquier archivo que importe el driver de MongoDB o acceda a colecciones para prevenir su empaquetado en el bundle del cliente.
4. **Matriz de Permisos centralizada:** El acceso se evalúa mediante `hasPermission(role, permission)` definido en `src/server/permissions/matrix.ts`. Nunca evaluar strings libres o lógicas dispersas.
5. **No auto-registro público:** Solo un administrador autenticado puede invitar o aprovisionar usuarios con roles (`ADMIN`, `SELLER`, `ACCOUNTANT`).
6. **Manejo de errores sanitizado:** Los endpoints de la API deben retornar códigos HTTP estándar y mensajes de error genéricos para fallos internos, registrando el stack trace real únicamente en logs del servidor con un `requestId`.

## 2. Calidad y Pruebas (QA Gates)

Antes de considerar completada cualquier fase del backlog:

1. **Typecheck:** `npm run typecheck` debe compilar sin emitir errores de TypeScript (`tsc --noEmit`).
2. **Linting:** `npm run lint` debe ejecutarse con cero warnings críticos.
3. **Pruebas unitarias:** `npm run test` (Vitest) debe cubrir:
   - Utilidades matemáticas de dinero (`sumCOP`, `discountAmount`, validaciones de enteros).
   - Cálculos y cortes de zona horaria Bogotá (`startOfBogotaDay`, `endOfBogotaDay`).
   - Matriz de permisos de roles (casos permitidos y denegados).
   - Validaciones de esquemas Zod en cada endpoint.
4. **Pruebas End-to-End (Fases avanzadas):** Playwright verificará flujos críticos en resolución móvil (360x780 y 390x844).
5. **Verificación de desborde responsive:** Cero scroll horizontal a 360 px de ancho de pantalla.
