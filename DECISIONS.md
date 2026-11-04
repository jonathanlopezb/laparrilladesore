# DECISIONS.md — Registro de decisiones arquitectónicas

Formato: cada decisión incluye contexto, opciones consideradas, decisión tomada y consecuencias.
Nunca borrar entradas; agregar una nueva si se revierte una decisión.

---

## ADR-001 Monolito modular Next.js

**Fecha:** 2026-11-04
**Estado:** Aprobado

**Contexto:** El negocio necesita consistencia entre ventas, pagos, caja e inventario.

**Opciones:**
- A) Monolito modular Next.js (elegida)
- B) Backend Express/NestJS separado

**Decisión:** Una sola aplicación Next.js con Route Handlers para endpoints HTTP y Server Actions para operaciones de formulario internas.

**Consecuencias:** Despliegue simple; módulos se separan por dominio internamente; si el crecimiento lo justifica se puede extraer un servicio.

---

## ADR-002 Driver nativo MongoDB (sin ORM)

**Fecha:** 2026-11-04
**Estado:** Aprobado

**Contexto:** El sistema requiere agregaciones complejas, transacciones multi-documento e índices explícitos.

**Decisión:** Usar el driver oficial `mongodb` sin Prisma ni Mongoose. Zod valida la entrada; TypeScript define los tipos de dominio.

**Consecuencias:** Control total sobre queries y esquemas; sin magia de ORM; requiere disciplina en la capa de repositorios.

---

## ADR-003 Better Auth para autenticación

**Fecha:** 2026-11-04
**Estado:** Aprobado

**Contexto:** Se necesita autenticación sin registro público, con adaptador MongoDB.

**Decisión:** `better-auth` con adaptador MongoDB. Sin JWT manual. Sin NextAuth.

---

## ADR-004 Dinero en enteros COP

**Fecha:** 2026-11-04
**Estado:** Aprobado

**Decisión:** Todos los valores monetarios se guardan como enteros en pesos colombianos (e.g. `priceCOP: 13000`). Nunca `float`.

---

## ADR-005 Vercel Pro para producción

**Fecha:** 2026-11-04
**Estado:** Pendiente confirmación del propietario

**Contexto:** Vercel Hobby es solo para uso personal/no comercial. La Parrilla de Sore es un negocio.

**Decisión propuesta:** Usar Vercel Pro (USD ~20/mes) o proveedor equivalente para producción.

**⚠️ Requiere confirmación del propietario antes del deploy productivo.**

---

## ADR-006 Vercel Blob privado vs S3/R2

**Fecha:** 2026-11-04
**Estado:** Pendiente

**Contexto:** Los soportes contables no deben estar en URLs públicas. La modalidad privada de Vercel Blob está en Beta.

**Decisión propuesta:** Evaluar disponibilidad de Vercel Blob privado; si no está disponible, usar S3/R2 con URLs firmadas.

**⚠️ Requiere validación antes de Phase 4 (soportes de facturas).**

---

## Decisiones de negocio pendientes (del propietario)

| # | Pregunta | Necesaria antes de | Valor por defecto |
|---|---|---|---|
| BIZ-01 | ¿Solo mostrador/para llevar o también mesas y domicilios? | P1-03 | Counter + takeaway |
| BIZ-02 | ¿Cantidades de papa, ensalada y salsa por plato? | P3-02 | Sin deducción hasta confirmar |
| BIZ-03 | ¿Stock negativo permitido? | P3-03 | No, solo admin con auditoría |
| BIZ-04 | ¿Descuentos permitidos? ¿Límite máximo? | P1-04 | Deshabilitados hasta confirmar |
| BIZ-05 | ¿Facturación electrónica DIAN en MVP? | P5+ | No en MVP |
| BIZ-06 | ¿Impresora térmica? ¿Marca y modelo? | P1-07 | Browser print hasta prueba real |
| BIZ-07 | ¿Pagos parciales permitidos? | P2-02 | Sí, parciales soportados |
| BIZ-08 | ¿Encabezado del recibo (dirección, teléfono)? | P1-07 | Solo nombre del negocio verificado |
| BIZ-09 | ¿Vercel Pro confirmado para producción? | P6-04 | Pendiente |
| BIZ-10 | ¿Región Atlas + región Vercel a usar? | P6-04 | us-east-1 / iad1 tentativo |
