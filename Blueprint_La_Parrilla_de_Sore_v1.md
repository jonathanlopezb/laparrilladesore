# LA PARRILLA DE SORE — Blueprint técnico v1.0

**Fecha:** 4 de noviembre de 2026  
**Objetivo:** construir un ERP ligero + CRM + POS para administrar pedidos, menú, vendedores, proveedores, inventario, caja, contabilidad administrativa y reportes.  
**Arquitectura:** Next.js full-stack (monolito modular) + MongoDB Atlas + Vercel.

---

## 1. Decisión de arquitectura

Se recomienda una sola aplicación Next.js con frontend, endpoints y lógica de negocio dentro del mismo repositorio. No se necesita un backend independiente en Express, NestJS o FastAPI para el alcance inicial.

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS 4 y shadcn/ui.
- **Backend:** Server Actions para operaciones internas de formularios y Route Handlers para endpoints HTTP, autenticación, cargas, exportaciones y tareas programadas.
- **Persistencia:** MongoDB Atlas usando el driver oficial `mongodb`.
- **Autenticación:** Better Auth con adaptador MongoDB.
- **Hosting:** Vercel Node.js Functions.
- **Archivos:** Vercel Blob para imágenes públicas del menú. Para facturas y soportes financieros, usar almacenamiento privado con autorización; la modalidad privada de Vercel Blob figura como Beta en la documentación consultada, por lo que se debe validar su disponibilidad antes de adoptarla o usar un almacén privado S3/R2 con enlaces firmados.

### Por qué monolito modular

El negocio necesita consistencia entre ventas, pagos, caja e inventario. Mantener los módulos en una misma aplicación facilita ejecutar una operación de negocio coordinada y reduce despliegues, costos y mantenimiento. Los módulos se separan por dominio para poder extraer un servicio independiente solo si el crecimiento futuro lo justifica.

## 2. Stack de librerías

| Área | Paquete | Uso |
|---|---|---|
| Framework | `next@16.4.5` | App Router y backend |
| Lenguaje | `typescript` | Tipado estático |
| UI | `shadcn/ui` | Componentes accesibles y personalizables |
| CSS | `tailwindcss` 4, `@tailwindcss/postcss` | Diseño responsive |
| Iconos | `lucide-react` | Iconografía |
| Base de datos | `mongodb` | Driver oficial, agregaciones y transacciones |
| Auth | `better-auth`, `@better-auth/mongo-adapter` | Login, sesiones y credenciales |
| Validación | `zod` | Validación compartida de datos |
| Formularios | `react-hook-form`, `@hookform/resolvers` | Formularios complejos |
| Tablas | `@tanstack/react-table` | Tablas y filtros |
| Gráficos | `recharts` | Indicadores y reportes |
| Estado POS | `zustand` | Carrito temporal de venta |
| Alertas UI | `sonner` | Toasts y confirmaciones |
| Fechas | `date-fns` | Fechas y rangos |
| Archivos | `@vercel/blob` | Imágenes y documentos según acceso |
| Pruebas unitarias | `vitest` | Servicios y reglas de negocio |
| Pruebas E2E | `@playwright/test` | Flujos completos del usuario |
| Observabilidad | `@sentry/nextjs` | Errores y rendimiento |

**Decisión de base de datos:** usar el driver nativo de MongoDB, no introducir Prisma/Mongoose inicialmente. El driver oficial facilita agregaciones, sesiones/transacciones, índices y control explícito de los documentos. Zod será la capa de validación de entrada y TypeScript definirá los tipos de dominio.

## 3. Módulos funcionales

### 3.1 Dashboard

Indicadores filtrables por hoy, semana, mes y rango:

- Ventas brutas y netas.
- Pedidos por estado y canal.
- Ticket promedio.
- Productos más vendidos.
- Costos directos y utilidad bruta estimada.
- Gastos registrados.
- Saldo de caja y diferencias de cierres.
- Deuda pendiente a proveedores y facturas vencidas.
- Insumos por debajo del mínimo.

La utilidad solo debe presentarse como estimada cuando falten costos de recetas, compras o gastos. No mostrar cifras de rentabilidad como definitivas si la información no está completa.

### 3.2 Pedidos / POS

Tipos de pedido: mesa, para llevar y domicilio. El pedido tendrá:

- Consecutivo legible (por ejemplo `PED-000125`).
- Cliente opcional, teléfono y canal de origen.
- Vendedor responsable y sucursal.
- Productos, cantidades, observaciones y extras.
- Precio, descuento autorizado, subtotal y total.
- Método(s) de pago y estado de pago.
- Estado operativo, notas y marcas de tiempo.
- Impresión de comanda y recibo de venta.

Estados operativos sugeridos: `draft`, `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`. El pago se maneja por separado: `unpaid`, `partial`, `paid`, `refunded`. No mezclar estado de cocina con estado financiero.

Reglas:

1. El vendedor puede crear pedidos, agregar productos disponibles y registrar pagos permitidos.
2. No puede cambiar precios ni autorizar descuentos fuera del límite asignado.
3. El pedido guarda una copia histórica del nombre y precio del producto. Cambiar el menú no modifica ventas pasadas.
4. Al confirmar el pedido se descuenta el consumo de ingredientes de la receta, dentro de una transacción.
5. Cancelar un pedido confirmado genera movimientos compensatorios de inventario y reversos de pago cuando proceda; nunca se borra el historial.
6. Los cambios de estado deben seguir transiciones permitidas y registrar quién los realizó.

### 3.3 Menú

Categorías iniciales: Pollo, Cerdo, Chorizos y Combos/Parrilladas. El administrador podrá crear categorías y productos, editar precios, activar/desactivar disponibilidad, cargar fotos, ordenar el menú y asociar recetas.

**Productos precargados desde el menú entregado:**

| Producto | Descripción | Precio |
|---|---|---:|
| Pollo | 200 g de pollo asado | $13.000 |
| Chuleta | 1 chuleta de cerdo con hueso | $12.000 |
| Chorizo | 1 chorizo asado | $10.000 |
| Pollo + Chorizo | 100 g de pollo + 1 chorizo | $15.000 |
| Chuleta + Chorizo | 1 chuleta + 1 chorizo | $14.000 |
| Chuleta + Pollo | 1 chuleta + 100 g de pollo | $16.000 |
| Parrillada Especial | Chuleta + pollo + chorizo | $20.000 |

Nota global visible: **Todos los platos incluyen papa, ensalada y salsa de la casa.**

Cada producto tendrá: `name`, `slug`, `sku`, `categoryId`, `description`, `priceCOP`, `imageUrl`, `isActive`, `isAvailable`, `recipeId`, `sortOrder`, `createdAt`, `updatedAt`.

### 3.4 Inventario y recetas

El inventario se controlará por insumos, no solo por productos vendidos. Ejemplos: pollo (kg), cerdo/chuleta (kg o unidad), chorizo (unidad), papa (kg), ensalada (kg), salsa (litros), empaques y bebidas si se agregan.

Funciones:

- Unidades y conversiones controladas (kg/g, litro/ml, unidad).
- Existencia actual y stock mínimo.
- Recetas/BOM: cantidad de cada ingrediente que consume un plato.
- Entradas por compra recibida.
- Salidas por venta confirmada, merma, consumo interno y ajuste autorizado.
- Historial de movimientos con usuario, fecha, motivo y documento origen.
- Costo promedio ponderado como primera política de costeo.

**Regla clave:** la existencia se deriva del libro de movimientos y se mantiene un saldo agregado (`inventory_balances`) para consultas rápidas. Nadie debe editar el saldo directamente sin generar un movimiento de ajuste auditado.

### 3.5 Proveedores y cuentas por pagar

Ficha de proveedor: razón social/nombre, NIT/CC, contacto, teléfono, correo, dirección, tipo de insumo, condiciones y estado.

- Compras/facturas con número, fecha, vencimiento, detalle y total.
- Recepción de mercancía separada del registro de la factura.
- Abonos y pagos, con medio de pago y soporte.
- Saldo por factura y saldo global por proveedor.
- Antigüedad de deuda: vigente, 1–30, 31–60, 61–90 y más de 90 días.
- Historial de compras y pagos.

**No escribir manualmente una deuda total del proveedor.** Se calcula como facturas recibidas menos notas/abonos y pagos aplicados. Puede almacenarse un agregado para acelerar reportes, pero debe poder reconstruirse desde los documentos.

### 3.6 Compras

Flujo: orden de compra (opcional) → recepción → factura → movimiento positivo de inventario → cuenta por pagar → pago(s).

No toda factura implica mercancía recibida; el inventario aumenta al confirmar la recepción real. Si el proveedor entrega parcialmente, se registran cantidades parciales.

### 3.7 Caja y ventas

- Apertura de caja por vendedor/turno con base inicial.
- Ingresos por efectivo, transferencia, Nequi/Daviplata, tarjeta u otros medios configurados.
- Entradas/salidas no asociadas a pedidos, con motivo y autorización.
- Cierre con valor esperado, valor contado, diferencia y observación.
- Historial de cierres y responsable.
- Pagos divididos entre varios medios.

Una sesión de caja no se puede cerrar dos veces. Las diferencias deben quedar visibles y auditadas.

### 3.8 Contabilidad administrativa

Primera versión: control interno de ingresos, compras, gastos, pagos, cuentas por pagar, caja y utilidad estimada. Categorías de gastos configurables: arriendo, servicios, nómina, transporte, mantenimiento, empaques, publicidad y otros.

**Alcance que no se debe confundir:** este módulo no equivale por sí solo a un software de contabilidad estatutaria colombiano, no genera automáticamente facturación electrónica DIAN ni reemplaza declaraciones tributarias o libros oficiales. Eso se puede integrar posteriormente con un proveedor tecnológico autorizado y asesoría contable.

### 3.9 Reportes

- Ventas por día, rango, vendedor, producto, categoría y canal.
- Pedidos anulados y descuentos.
- Métodos de pago.
- Cierre de caja y diferencias.
- Compras por proveedor.
- Cuentas por pagar y vencimientos.
- Kardex/movimientos de inventario y mermas.
- Costo de recetas y margen bruto estimado.
- Gastos y resultado operativo estimado.
- Exportación CSV/Excel y formatos imprimibles.

### 3.10 Usuarios y roles

No habrá registro público. El administrador crea usuarios, asigna el rol y entrega acceso inicial; el usuario cambia su contraseña al ingresar.

**Administrador:** control total, configuración, usuarios, menú, proveedores, compras, inventario, caja, ajustes, anulaciones y reportes.

**Vendedor:** consulta menú/disponibilidad, crea y actualiza pedidos dentro del flujo permitido, registra pagos, imprime comandas/recibos y consulta sus ventas/turno. No ve costos, utilidad, deuda global ni contabilidad.

**Contador:** consulta ventas, caja, compras, gastos, pagos, proveedores, cuentas por pagar y reportes financieros; puede registrar pagos/conciliaciones según autorización. No cambia el menú, no crea usuarios y no elimina pedidos.

Los permisos deben definirse en servidor por acción, no solo ocultando botones en la interfaz. Dejar una matriz de permisos editable en una futura fase.

### 3.11 Clientes y configuración

Clientes opcionales para historial y domicilios. Configuración: datos del establecimiento, sucursal, zona horaria `America/Bogota`, moneda COP, numeraciones, medios de pago, categorías de gasto, mínimos de inventario y parámetros de impresión.

### 3.12 Auditoría y alertas

Registrar creación/edición de precio, anulación, descuento, ajuste de inventario, compra, abono, pago, apertura/cierre de caja y cambios de permisos. Guardar usuario, fecha, acción, entidad, identificador, valores anteriores/nuevos cuando sea pertinente y motivo.

Alertas: stock bajo, cuenta por pagar vencida, caja sin cerrar y pedido demorado.

---

## 4. Roles y permisos — matriz inicial

| Acción | Administrador | Vendedor | Contador |
|---|:---:|:---:|:---:|
| Ver dashboard general | Sí | Limitado | Sí |
| Crear pedidos | Sí | Sí | No |
| Editar pedidos no cerrados | Sí | Sí, propios | No |
| Anular pedido | Sí | Solicitar | No |
| Cambiar precios del menú | Sí | No | No |
| Ver costos/utilidad | Sí | No | Sí |
| Gestionar proveedores | Sí | No | Consulta |
| Registrar compras/recepción | Sí | No | Según permiso |
| Registrar pago a proveedor | Sí | No | Sí |
| Ajustar inventario | Sí | No | Consulta |
| Registrar gastos | Sí | No | Sí |
| Abrir/cerrar caja | Sí | Sí, propia | Consulta/conciliar |
| Ver reportes financieros | Sí | No | Sí |
| Crear/desactivar usuarios | Sí | No | No |
| Configurar sistema | Sí | No | No |
| Consultar auditoría | Sí | No | Según permiso |

Las acciones sensibles deben requerir motivo, y algunas pueden exigir reautenticación o autorización del administrador.

## 5. Modelo de datos MongoDB

Colecciones principales sugeridas:

| Colección | Responsabilidad |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth |
| `branches` | Sucursales (aunque inicialmente exista una) |
| `categories` | Categorías de menú |
| `products` | Productos vendibles y precios vigentes |
| `ingredients` | Insumos y unidades |
| `recipes` | Ingredientes por producto |
| `inventory_balances` | Saldo actual agregado por insumo/sucursal |
| `stock_movements` | Libro inmutable de entradas y salidas |
| `orders` | Pedidos y sus líneas históricas |
| `payments` | Pagos y reversos |
| `cash_sessions` | Aperturas y cierres |
| `cash_movements` | Entradas/salidas de caja |
| `suppliers` | Terceros proveedores |
| `purchases` | Facturas/recepciones y líneas de compra |
| `supplier_payments` | Pagos y aplicaciones a facturas |
| `expenses` | Gastos operativos |
| `customers` | Clientes opcionales |
| `audit_logs` | Historial de acciones sensibles |
| `counters` | Consecutivos atómicos |
| `settings` | Configuración del negocio |

### Convenciones de documentos

- Todos los documentos operativos incluyen `branchId`, `createdAt`, `updatedAt` y `createdBy` cuando aplique.
- Guardar fechas en UTC; calcular inicio/fin de día usando `America/Bogota`.
- Guardar importes como enteros en pesos colombianos: `priceCOP: 13000`. Evitar `float` para dinero.
- Los pedidos guardan `productSnapshot` (nombre, SKU, precio, descripción) y `costSnapshot` cuando se conoce el costo.
- Un pago es un documento separado del pedido, para permitir pagos parciales y pagos divididos.
- Los movimientos de inventario y auditoría no se borran físicamente: se corrigen mediante movimientos compensatorios.

### Índices mínimos

- `products`: `{ branchId: 1, sku: 1 }` único.
- `orders`: `{ branchId: 1, orderNumber: 1 }` único.
- `orders`: `{ branchId: 1, createdAt: -1 }`.
- `orders`: `{ branchId: 1, status: 1, createdAt: -1 }`.
- `stock_movements`: `{ branchId: 1, ingredientId: 1, createdAt: -1 }`.
- `stock_movements`: `{ sourceType: 1, sourceId: 1, sourceLineId: 1, movementType: 1 }` para idempotencia, según política de unicidad.
- `suppliers`: `{ branchId: 1, taxId: 1 }` único cuando exista identificación.
- `purchases`: `{ branchId: 1, supplierId: 1, dueDate: 1 }`.
- `payments`: `{ branchId: 1, orderId: 1, createdAt: -1 }`.
- `audit_logs`: `{ branchId: 1, entityType: 1, entityId: 1, createdAt: -1 }`.

## 6. Operaciones críticas y transacciones

MongoDB Atlas debe utilizar un clúster compatible con transacciones multi-documento (replica set o clúster fragmentado). Se usarán sesiones del driver.

### Confirmar pedido

1. Verificar sesión, rol, sucursal y estado actual.
2. Leer pedido y receta vigente; calcular consumo requerido.
3. Abrir transacción.
4. Cambiar pedido a `confirmed` con control de versión/estado anterior.
5. Verificar stock y actualizar saldos.
6. Insertar movimientos de salida con referencia única al pedido/línea.
7. Registrar auditoría.
8. Confirmar transacción; si falla cualquier paso, revertir todo.

### Recibir compra

1. Validar proveedor, factura y cantidades recibidas.
2. En una transacción, registrar recepción, entradas de inventario y cuenta por pagar.
3. No duplicar recepción ante reintentos HTTP: usar una clave de idempotencia.

### Registrar pago

1. Validar que el monto no exceda el saldo permitido salvo anticipo autorizado.
2. Insertar pago y aplicarlo a las facturas/pedido correspondiente.
3. Actualizar estado derivado de saldo y registrar movimiento de caja si aplica.
4. Guardar auditoría.

**Regla transversal:** toda operación que pueda ser reintentada debe ser idempotente. Usar IDs de operación o claves únicas para impedir doble descuento de inventario o doble registro de pago.

## 7. Estructura de carpetas propuesta

```text
la-parrilla-de-sore/
├── public/
│   ├── brand/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (dashboard)/layout.tsx
│   │   ├── (dashboard)/page.tsx
│   │   ├── (dashboard)/pedidos/page.tsx
│   │   ├── (dashboard)/pedidos/nuevo/page.tsx
│   │   ├── (dashboard)/menu/page.tsx
│   │   ├── (dashboard)/proveedores/page.tsx
│   │   ├── (dashboard)/compras/page.tsx
│   │   ├── (dashboard)/inventario/page.tsx
│   │   ├── (dashboard)/caja/page.tsx
│   │   ├── (dashboard)/contabilidad/page.tsx
│   │   ├── (dashboard)/reportes/page.tsx
│   │   ├── (dashboard)/usuarios/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts
│   │       ├── uploads/route.ts
│   │       ├── exports/route.ts
│   │       └── cron/daily/route.ts
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── pos/
│   │   └── shared/
│   ├── features/
│   │   ├── orders/
│   │   ├── menu/
│   │   ├── suppliers/
│   │   ├── purchases/
│   │   ├── inventory/
│   │   ├── cash/
│   │   ├── accounting/
│   │   ├── reports/
│   │   └── users/
│   ├── server/
│   │   ├── auth/
│   │   ├── dal/
│   │   ├── db/
│   │   ├── permissions/
│   │   └── modules/
│   │       ├── orders/{schema,repository,service,actions}.ts
│   │       ├── inventory/{schema,repository,service}.ts
│   │       ├── purchases/{schema,repository,service}.ts
│   │       └── ...
│   ├── lib/
│   │   ├── format/
│   │   ├── dates/
│   │   ├── env.ts
│   │   └── utils.ts
│   └── types/
├── tests/
│   ├── unit/
│   └── e2e/
├── .env.example
├── next.config.ts
├── postcss.config.mjs
└── vercel.json
```

**Dependencia entre capas:** `page/component → action/route → service → repository → MongoDB`. Los componentes no importan el driver ni consultan colecciones directamente. Los servicios contienen reglas de negocio; los repositorios contienen consultas y escrituras.

## 8. Backend y compatibilidad con Vercel

### Sí es viable desplegarlo en Vercel

Vercel ejecuta el backend Next.js mediante Node.js Functions y escala las solicitudes. Para este sistema funcionan bien:

- Login, sesiones y autorización.
- CRUD de pedidos, productos, usuarios, proveedores y compras.
- Consultas y agregaciones MongoDB para el dashboard y reportes.
- Transacciones MongoDB para venta, inventario, pagos y compras.
- Generación de CSV/Excel y documentos de impresión dentro de límites razonables.
- Cargas de imágenes y archivos mediante Vercel Blob.
- Tareas programadas para recordatorios y verificaciones.

### Restricciones que debemos respetar

1. **No alojar un servidor WebSocket propio en Vercel Functions.** Para el tablero de cocina inicial usar refresco/polling cada pocos segundos. Si más adelante se necesita tiempo real instantáneo, integrar Ably, Pusher u otro servicio administrado.
2. **No depender de procesos permanentes ni workers dentro de Next.js.** Las funciones son invocaciones administradas. Las tareas cortas pueden usar `after()`; los procesos durables y reintentables deben usar un servicio de jobs externo.
3. **Cron Hobby es limitado a una ejecución diaria y su precisión es horaria.** Para tareas más frecuentes se requiere Pro u otro scheduler. No usar cron para actualizar cada pedido.
4. **Elegir Node.js Runtime para las funciones que usan el driver de MongoDB.** No forzar Edge Runtime para acceso a base de datos con el driver nativo.
5. **Uploads:** evitar enviar archivos grandes por una función server-side; usar carga directa a almacenamiento de objetos. No guardar soportes contables en URLs públicas. La modalidad privada de Vercel Blob figura como Beta; validarla antes de depender de ella o usar almacenamiento privado S3/R2 con URL firmada.
6. **Conexiones MongoDB:** reutilizar un `MongoClient` por instancia de función, configurar un pool razonable y limitar conexiones concurrentes. No crear una conexión nueva por cada consulta.
7. **Ubicación:** seleccionar una región de funciones Vercel cercana a la región de MongoDB Atlas para reducir latencia.

### Restricción comercial del plan

Vercel Hobby es únicamente para uso personal/no comercial. Como La Parrilla de Sore es un negocio, el despliegue productivo requiere Vercel Pro o un proveedor cuyo plan permita uso comercial. El precio base publicado de Pro es USD 20/mes, con crédito de uso incluido y posible cobro adicional según consumo. Revisar factura y términos al contratar.

### MongoDB Atlas

Para desarrollo se puede comenzar con Free Cluster, respetando su límite documentado de 0,5 GB y restricciones. Para producción valorar Flex o un clúster dedicado con copias de seguridad y capacidad adecuada. No asumir que el free tier es una estrategia de respaldo empresarial.

## 9. Variables de entorno

```env
# MongoDB Atlas — solo servidor
MONGODB_URI="mongodb+srv://..."
MONGODB_DB="parrilla_sore"

# Better Auth
BETTER_AUTH_SECRET="secreto-aleatorio-largo"
BETTER_AUTH_URL="http://localhost:3000"

# URL pública de la app (no es un secreto)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Vercel Blob, agregar cuando se conecte el almacén
BLOB_READ_WRITE_TOKEN="..."

# Cron, secreto aleatorio
CRON_SECRET="..."

# Sentry, opcional
SENTRY_AUTH_TOKEN="..."
```

No usar `NEXT_PUBLIC_` en secretos. Agregar los valores de producción en Vercel Environment Variables y mantener `.env.local` fuera de Git.

## 10. Comandos de arranque

Crear el proyecto:

```bash
npx create-next-app@latest la-parrilla-de-sore \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd la-parrilla-de-sore
```

Instalar librerías principales:

```bash
npm install mongodb zod better-auth @better-auth/mongo-adapter \
  react-hook-form @hookform/resolvers @tanstack/react-table \
  recharts zustand sonner date-fns lucide-react
```

Instalar integraciones y herramientas opcionales:

```bash
npm install @vercel/blob @sentry/nextjs
npm install -D vitest @playwright/test
```

Inicializar componentes:

```bash
npx shadcn@latest init
```

Después de inicializar, añadir componentes shadcn según los módulos: button, card, dialog, dropdown-menu, form, input, select, table, tabs, badge, sheet, sidebar, chart, calendar, popover, command y alert-dialog.

## 11. Orden de desarrollo

### Sprint 0 — Fundaciones

- Crear repositorio Git privado y proyecto Next.js.
- Configurar MongoDB Atlas y conexión reutilizable.
- Configurar Better Auth y primer administrador.
- Construir layout, navegación, tema y componentes base.
- Crear permisos y auditoría inicial.

**Criterio de salida:** login protegido y dashboard vacío con navegación según permisos.

### Sprint 1 — Menú y pedidos

- Crear categorías/productos y precargar los siete platos del menú.
- Implementar carrito POS, pedido, estados, impresión y pagos básicos.
- Implementar consecutivos seguros.

**Criterio de salida:** un vendedor crea y entrega un pedido con total correcto y registro histórico.

### Sprint 2 — Caja

- Apertura, movimientos, métodos de pago, cierre y diferencias.
- Asociar todos los pagos al pedido y sesión de caja.

**Criterio de salida:** las ventas cobradas cuadran con el cierre por medio de pago.

### Sprint 3 — Proveedores y compras

- Proveedores, compras, recepción, facturas, pagos y saldos.
- Soportes y vencimientos.

**Criterio de salida:** una compra recibida aumenta el inventario y crea la obligación al proveedor sin duplicados.

### Sprint 4 — Inventario y recetas

- Insumos, unidades, recetas, existencias, mínimos, mermas y ajustes.
- Descuento automático al confirmar pedido y reversión por anulación.

**Criterio de salida:** una venta descuenta cantidades correctas; una anulación deja trazabilidad y saldo correcto.

### Sprint 5 — Contabilidad administrativa y reportes

- Gastos, reportes de venta, costo, utilidad estimada, cuentas por pagar y exportaciones.
- Cierres de período y permisos del contador.

**Criterio de salida:** reportes reproducibles desde pedidos, compras, pagos, movimientos y gastos.

### Sprint 6 — Endurecimiento y producción

- Pruebas unitarias y E2E, revisión de permisos, logs, backups, límites, rate limiting y restauración.
- Deploy Preview, pruebas con datos de prueba y luego Production.

## 12. Reglas no negociables

1. Toda validación importante ocurre en servidor.
2. Cada Server Action y Route Handler valida sesión, rol y sucursal.
3. No confiar en el precio enviado desde el navegador: recuperar el precio vigente desde la base de datos y calcular el total en servidor.
4. No borrar pedidos, pagos, movimientos de inventario ni auditorías: usar anulaciones/reversiones.
5. Usar transacciones donde una acción afecte varios documentos.
6. Idempotencia para prevenir dobles pagos, dobles compras y doble descuento de stock.
7. Guardar dinero en enteros COP y fechas en UTC con reglas de día de negocio `America/Bogota`.
8. Ocultar una opción en la UI no constituye autorización.
9. El respaldo debe probarse mediante restauración, no solo activarse.
10. No almacenar datos de tarjetas ni contraseñas en texto plano.

## 13. Decisiones pendientes antes del POS definitivo

- ¿La operación será una sola sede o se prevén varias? El modelo propuesto admite varias sucursales.
- ¿Los pedidos serán solo mostrador/para llevar o también mesas y domicilios?
- ¿Se registrará el pago completo al crear el pedido o se permitirán anticipos y pagos parciales?
- ¿Se imprimirá en impresora térmica de 80 mm?
- ¿Se requiere facturación electrónica DIAN desde el primer lanzamiento o se integra más adelante?
- ¿Quién puede autorizar descuentos, anulaciones, gastos y ajustes de inventario?

**Supuesto inicial para programar:** una sede, pedidos de mostrador y para llevar, pagos en efectivo/transferencia/Nequi/tarjeta registrados manualmente, impresión de recibo térmico y contabilidad administrativa (sin facturación electrónica DIAN en esta primera versión).

---

## 14. Fuentes técnicas consultadas

- Next.js 16 y soporte: https://nextjs.org/blog/next-16 y https://nextjs.org/support-policy
- App Router: https://nextjs.org/docs/app
- Autenticación y autorización Next.js: https://nextjs.org/docs/app/guides/authentication
- Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Integración Next.js + MongoDB: https://www.mongodb.com/docs/drivers/node-frameworks/next-integration/
- Transacciones MongoDB: https://www.mongodb.com/docs/drivers/node/current/crud/transactions/
- Better Auth MongoDB adapter: https://better-auth.com/docs/adapters/mongo
- Vercel Functions: https://vercel.com/docs/functions
- Límites Vercel y WebSockets: https://vercel.com/docs/limits
- Vercel Cron: https://vercel.com/docs/cron-jobs/usage-and-pricing
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Planes y uso comercial Vercel: https://vercel.com/docs/plans/hobby y https://vercel.com/pricing
