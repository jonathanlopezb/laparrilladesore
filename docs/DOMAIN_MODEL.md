# DOMAIN_MODEL.md — Modelo de Dominio de Datos

**La Parrilla de Sore** — Especificación de entidades, colecciones y reglas de integridad.

## 1. Principios de persistencia

1. **Moneda en enteros COP:** Todos los precios, subtotales, totales, costos y pagos se almacenan en enteros de pesos colombianos (`priceCOP: 13000`). Prohibido el uso de flotantes para dinero.
2. **Fechas en UTC, interpretación en Bogotá:** Todos los campos de marca de tiempo (`createdAt`, `updatedAt`, `openedAt`, `closedAt`, `issueDate`) se persisten en UTC. Los cortes de día de negocio, cierres de caja y filtros de reportes se calculan estrictamente con la zona horaria `America/Bogota`.
3. **Inmutabilidad y trazabilidad:** Órdenes confirmadas, pagos, movimientos de inventario y logs de auditoría son de solo lectura una vez asentados. Las correcciones se realizan exclusivamente mediante eventos compensatorios (reversos, notas o anulaciones auditadas).
4. **Particionamiento por sucursal (`branchId`):** Toda entidad operativa debe incluir un `branchId: ObjectId` indexado para garantizar aislamiento multisede desde el diseño inicial.
5. **Idempotencia transaccional:** Toda mutación crítica (confirmar orden, procesar pago, asentar compra) debe aceptar una clave `idempotencyKey` para evitar registros duplicados en reintentos de red.

## 2. Colecciones del Sistema

### 2.1 Identidad y Acceso (Better Auth + Control Interno)
- `user`: Perfil de usuario, rol (`ADMIN`, `SELLER`, `ACCOUNTANT`), sucursales asignadas (`branchIds`), estado activo y requerimiento de cambio de contraseña.
- `session`: Sesión activa de Better Auth vinculada al token y usuario.
- `account`: Cuentas de autenticación por credenciales (email y hash).

### 2.2 Sucursales y Configuración
- `branches`: Registro de sedes operativas, zona horaria (`America/Bogota`), moneda (`COP`) y estado activo.
- `settings`: Parámetros operativos por sucursal (canales habilitados, métodos de pago, textos de encabezado/pie de comanda, política de inventario negativo).
- `counters`: Secuencias atómicas con `$inc` para consecutivos de negocio legibles (`PED-000001`, `FAC-000001`).

### 2.3 Menú y Recetas
- `categories`: Clasificación del menú (Pollo, Cerdo, Chorizos, Combos/Parrilladas).
- `products`: Catálogo vendible con SKU, nombre, descripción, precio vigente en COP, orden de visualización y estado de disponibilidad.
- `recipes`: Ficha técnica de insumos necesarios por producto con cantidades en unidad base y factor de merma estimado.

### 2.4 Inventario y Kardex
- `ingredients`: Maestro de insumos (unidad base en gramos, mililitros o unidades), umbral mínimo de reorden y costo promedio ponderado.
- `inventory_balances`: Saldo consolidado en tiempo real por insumo y sucursal.
- `stock_movements`: Libro mayor inmutable de movimientos de almacén (`OPENING`, `PURCHASE_RECEIPT`, `SALE_CONSUMPTION`, `WASTE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `REVERSAL`).

### 2.5 Pedidos y POS
- `orders`: Documento central del pedido con consecutivo (`orderNumber`), vendedor, canal (`counter`, `takeaway`, `table`, `delivery`), snapshot histórico de productos y precios al momento de la venta, subtotal, descuento, total y cronología de estados (`DRAFT`, `CONFIRMED`, `IN_PREPARATION`, `READY`, `DELIVERED`, `CANCELLED`).
- `payments`: Registro de transacciones financieras individuales asociadas a un pedido o sesión de caja, método de pago y monto.

### 2.6 Caja y Tesorería
- `cash_sessions`: Turno de caja por usuario, base inicial, arqueo de cierre, efectivo esperado vs contado, y justificación de descuadre.
- `cash_movements`: Ingresos y egresos manuales no asociados a órdenes directas.
- `expenses`: Registro de gastos administrativos y operativos con categoría y aprobación.

### 2.7 Proveedores y Compras
- `suppliers`: Directorio de proveedores, identificación fiscal (NIT/CC), plazos de pago y contacto.
- `purchases`: Facturas o remisiones de compra con detalle de insumos, cantidades y costos unitarios.
- `supplier_payments`: Abonos aplicados contra facturas de compra.

### 2.8 Auditoría
- `audit_logs`: Registro histórico append-only de modificaciones sensibles con usuario, IP, motivo y diferencias (valor anterior vs nuevo).
