# AGENTS.md — Guía para agentes de IA

## Proyecto

**La Parrilla de Sore** — ERP ligero + CRM + POS para restaurante.
Stack: Next.js App Router · TypeScript · MongoDB Atlas · Vercel.

## Documentos fuente de verdad

Lee en este orden antes de actuar:

1. `AGENTS.md` (este archivo)
2. `docs/BLUEPRINT.md` — arquitectura y diseño de producto
3. `docs/DOMAIN_MODEL.md` — modelo de datos detallado
4. `docs/SECURITY_AND_QA.md` — reglas de seguridad y calidad
5. `docs/DEPLOYMENT.md` — instrucciones de despliegue
6. `BACKLOG.md` — tareas por fase
7. `DECISIONS.md` — decisiones arquitectónicas registradas
8. `.agents/skills/` — skills especializadas para tareas recurrentes

## Reglas innegociables

1. **Validación siempre en servidor.** Todo Route Handler y Server Action valida sesión, rol, sucursal y datos con Zod.
2. **Precio desde BD.** No confiar en precios enviados por el navegador; calcular totales en servidor.
3. **Sin MongoDB en cliente.** El driver solo se importa en archivos `server-only`.
4. **No borrar historial.** Pedidos, pagos, movimientos de inventario y auditorías son inmutables; usar anulaciones/reversiones.
5. **Transacciones para operaciones multi-documento.** Confirmar pedido, recibir compra y registrar pago usan sesiones MongoDB.
6. **Idempotencia.** Toda operación reintentable lleva clave de idempotencia.
7. **Dinero en enteros COP.** Nunca usar float para dinero.
8. **Fechas en UTC, mostrar en Bogotá.** `America/Bogota` para cálculos de día de negocio.
9. **Mobile-first 360/390 px.** Escritorio después.
10. **Sin datos inventados.** No fabricar precios, recetas, costos, impuestos, dirección ni logo.
11. **Ocultar un botón no es autorización.** Los permisos se verifican en el servidor.
12. **Una tarea a la vez.** Termina y verifica un ID de backlog antes de avanzar al siguiente.

## Arquitectura de capas

```
page / component
  → Server Action / Route Handler
    → Permission Guard (sesión + rol)
      → Zod Validation
        → Application Service (reglas de negocio)
          → Repository (queries MongoDB)
            → MongoClient (singleton server-only)
```

## Convenciones de código

- Importar `server-only` en cualquier archivo que use el driver de MongoDB.
- Rutas API: `/api/v1/<recurso>` con respuesta `{ data, meta }` o `{ error }`.
- Colecciones centralizadas en `src/server/db/collections.ts`.
- Tipos TypeScript en `src/shared/types/collections.ts`.
- Permisos en `src/server/permissions/matrix.ts`.
- Dinero: `src/shared/money/index.ts`.
- Fechas: `src/shared/dates/index.ts`.
- Audit log: `src/server/audit/logger.ts`.

## Proceso de trabajo

1. Lee el ID de backlog asignado completamente.
2. Revisa decisiones pendientes en `DECISIONS.md`.
3. Implementa, test, typecheck, lint.
4. Reporta: archivos cambiados · comandos ejecutados · resultados · pruebas · siguiente ID.
5. No declares una tarea completa si las pruebas no pasan.

## Sprint 0 — IDs

- **P0-01** Repositorio Git, `package.json`, configuración base ✅ (en progreso)
- **P0-02** MongoDB Atlas: conexión reutilizable, índices, seed branch inicial
- **P0-03** Better Auth: configuración, primer admin, rutas de sesión
- **P0-04** Layout, navegación mobile + desktop, tema brand
- **P0-05** Middleware de sesión y permisos
- **P0-06** CI: typecheck, lint, test unitario
