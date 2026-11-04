# BACKLOG.md — La Parrilla de Sore

Fuente de verdad del trabajo pendiente. Un ID a la vez; no avanzar sin verificar el anterior.

---

## Phase 0 — Fundaciones

| ID | Tarea | Estado | Criterio de salida |
|---|---|---|---|
| P0-01 | Repositorio Git, package.json, Next.js config, tsconfig, Tailwind, ESLint, .gitignore, .env.example | 🔄 En progreso | `npm run build` pasa sin errores |
| P0-02 | MongoDB Atlas: cliente singleton, colecciones tipadas, índices críticos, seed de branch inicial | ⏳ Pendiente | `getDb()` conecta; índices creados; branch "Principal" existe |
| P0-03 | Better Auth: config, rutas `/api/auth`, primer admin por script, guard de sesión | ⏳ Pendiente | Login con email/contraseña funciona; sesión protege rutas |
| P0-04 | Layout y navegación: bottom nav mobile (Vendedor), sidebar desktop, tema brand, componentes base | ⏳ Pendiente | Sin desborde a 360 px; nav visible según rol |
| P0-05 | Middleware Next.js: redirige no-autenticados a /login; bloquea rutas por rol | ⏳ Pendiente | Ruta protegida devuelve 403 sin sesión válida |
| P0-06 | CI local: typecheck (`tsc --noEmit`), ESLint, `vitest run`, `next build` | ⏳ Pendiente | Todo pasa sin errores ni warnings críticos |

---

## Phase 1 — Menú y Pedidos

| ID | Tarea | Estado |
|---|---|---|
| P1-01 | Seed de categorías y 7 productos iniciales | ⏳ |
| P1-02 | CRUD de menú (admin): crear, editar, archivar categorías y productos | ⏳ |
| P1-03 | POS móvil: carrito Zustand, selección de productos, notas, canal | ⏳ |
| P1-04 | Crear pedido: Server Action con precio desde BD, snapshot, consecutivo, transacción | ⏳ |
| P1-05 | Vista de pedidos y detalle por ID | ⏳ |
| P1-06 | Transiciones de estado (CONFIRMED → IN_PREPARATION → READY → DELIVERED) | ⏳ |
| P1-07 | Recibo/comanda imprimible (browser print) | ⏳ |

---

## Phase 2 — Caja y Pagos

| ID | Tarea | Estado |
|---|---|---|
| P2-01 | Apertura de sesión de caja | ⏳ |
| P2-02 | Registrar pago: métodos, pago parcial, pago dividido | ⏳ |
| P2-03 | Cierre de caja: esperado vs contado, diferencia | ⏳ |
| P2-04 | Movimientos de caja no asociados a pedido | ⏳ |

---

## Phase 3 — Inventario y Recetas

| ID | Tarea | Estado |
|---|---|---|
| P3-01 | Catálogo de ingredientes | ⏳ |
| P3-02 | Recetas (BOM) por producto | ⏳ |
| P3-03 | Ajustes, mermas y aperturas de inventario | ⏳ |
| P3-04 | Descuento automático al confirmar pedido (transacción) | ⏳ |
| P3-05 | Reversión de inventario al cancelar pedido | ⏳ |

---

## Phase 4 — Proveedores y Compras

| ID | Tarea | Estado |
|---|---|---|
| P4-01 | Catálogo de proveedores | ⏳ |
| P4-02 | Facturas de compra y recepción de mercancía | ⏳ |
| P4-03 | Cuentas por pagar: saldo, antigüedad, pagos parciales | ⏳ |

---

## Phase 5 — Contabilidad y Reportes

| ID | Tarea | Estado |
|---|---|---|
| P5-01 | Registro de gastos y categorías | ⏳ |
| P5-02 | Reportes de ventas por período/producto/vendedor | ⏳ |
| P5-03 | Reporte de cuentas por pagar y vencimientos | ⏳ |
| P5-04 | Reporte de inventario y kardex | ⏳ |
| P5-05 | Exportación CSV | ⏳ |

---

## Phase 6 — Endurecimiento y Producción

| ID | Tarea | Estado |
|---|---|---|
| P6-01 | Tests E2E Playwright (flujos críticos) | ⏳ |
| P6-02 | Rate limiting, headers de seguridad, revisión de permisos | ⏳ |
| P6-03 | Backups Atlas probados mediante restauración | ⏳ |
| P6-04 | Deploy Preview → Production con secretos de producción | ⏳ |
| P6-05 | Documentación de operación y recuperación | ⏳ |
