# Product and Technical Blueprint — La Parrilla de Sore

Version 2.0 · 2026-11-04 · Status: approved baseline for implementation, subject to explicit owner decisions recorded in `DECISIONS.md`.

## 1. Product definition

**La Parrilla de Sore** is a mobile-first restaurant operations application (POS + lightweight ERP + CRM) for the business owner, administrators, sellers/cashiers and accountant. It manages the operational chain:

`Menu → Order → Kitchen/Preparation → Payment/Cash → Inventory consumption → Cost of sale → Reports`

and the purchasing chain:

`Supplier → Purchase invoice → Goods received → Inventory increase → Accounts payable → Supplier payment → Cash outflow → Reports`.

It must not be a collection of disconnected CRUD pages. A committed business event must update all related records consistently and leave an auditable trail.

### Goals for the first release

- Take and track customer orders quickly from a phone or tablet.
- Maintain the seven products and prices from the supplied menu.
- Let authorized staff manage menu items, availability, categories and recipe links.
- Track ingredients, inventory entries/consumption, waste and adjustments.
- Maintain supplier contacts, purchase invoices, partial payments, due dates and balances.
- Open/close cash sessions, register payments and expenses, and explain cash differences.
- Create/disable sellers and assign the approved role and branch scope.
- Provide understandable sales, margin estimate, expenses, inventory and supplier debt reports.
- Keep a complete audit trail for sensitive actions.
- Be installable as a PWA and pleasant to operate on mobile.

### Explicit non-goals for MVP

- Native iOS/Android apps (PWA first; Expo can be evaluated later).
- Electronic invoicing / DIAN integration, payroll, bank-feed reconciliation, statutory tax filings or a claim of Colombian statutory accounting compliance.
- Multi-company SaaS billing or public self-registration.
- Loyalty points, marketing automation and advanced customer segmentation.
- Complex recipe variants, lot traceability, expiry/FEFO, barcode hardware integrations and multi-warehouse routing unless added to backlog.
- Offline order submission/payment. MVP requires an online connection to commit an order; draft cart may be retained locally but must not be treated as a sale.

## 2. Product assumptions to keep visible

1. Initial rollout has one legal/business entity and one operational branch. The data model is branch-ready so a second location does not require redesign.
2. Currency is COP. The initial menu prices are final displayed prices as supplied; no IVA, withholding or tax treatment is inferred.
3. The product catalog initially contains the seven menu entries in Section 5. Their ingredient recipes must be configured/confirmed before automatic stock deduction is enabled.
4. The app supports order channels `counter`, `takeaway`, `table` and `delivery` at the data-model level. Operational UI for tables/delivery is feature-flagged until the owner confirms those workflows.
5. Cash, bank transfer, Nequi, Daviplata and card are proposed payment-method options, not integrated gateways. Staff manually confirm transfer/card settlement in MVP.
6. User roles start as `ADMIN`, `SELLER` and `ACCOUNTANT`. Permissions are granular and enforced server-side.
7. The timezone is `America/Bogota`. All persisted timestamps are UTC; business-day boundaries and displays use the branch timezone.
8. Accounting in MVP means internal management records: sales, cash movements, purchase obligations, payments, expenses, stock value and estimated margins. A professional accountant must validate any future Colombian tax/accounting configuration before it is treated as statutory accounting.

If an assumption proves false, create an ADR and update acceptance criteria before changing code.

## 3. Mobile-first experience

### Target devices

- Primary: phone 360–430 CSS px wide; reference viewport 390 × 844.
- Secondary: tablet 768–1024 px.
- Desktop: 1280–1440 px and larger.
- Test portrait and landscape where the screen meaningfully changes, especially tablet POS/kitchen views.

### Mobile navigation

Seller bottom navigation (maximum five primary entries):

1. Inicio
2. Nuevo pedido
3. Pedidos
4. Caja
5. Más

The `Más` screen exposes only permitted areas. Admin and accountant receive role-specific navigation. Desktop uses a collapsible side navigation; do not force a desktop sidebar on narrow phones.

### POS order screen

- Sticky top bar with branch, active cash session and connectivity state.
- Search and category chips; product cards with image, name, price and availability.
- Add/remove quantity using large touch targets; clear selected state.
- Persistent cart summary; on a phone, use a bottom sheet/drawer rather than permanently consuming half the viewport.
- Show included accompaniments (“papa, ensalada y salsa de la casa”) clearly; do not silently add separate charges.
- Order notes, channel and optional customer/contact fields.
- Payment capture and receipt only after server confirms success.
- Display saving/error state and prevent duplicate taps while request is pending.

### Kitchen / preparation view

- High-contrast order cards, elapsed time and status.
- Large controls for `CONFIRMED → IN_PREPARATION → READY → DELIVERED`.
- Do not allow seller to bypass restricted transitions.
- New order notifications may use polling initially; add real-time WebSockets in a later task when the deployment path, reconnect behavior and authorization are tested.

### Responsive quality gates

- No horizontal page overflow at 360 px.
- Primary actions remain reachable without precision tapping.
- Every screen has loading, empty, error, permission-denied, saving and retry states.
- Touch targets at least 44 × 44 CSS px where practical.
- Forms use appropriate mobile keyboards (`tel`, `decimal`, `email`, etc.) and never hide validation messages behind the keyboard.
- Tables transform to cards or horizontally scroll within a bounded container, never overflow the whole page.
- The application is usable with keyboard and screen reader; color alone does not convey status.

## 4. Brand and interface direction

Use the supplied menu as the visual source of truth:

- Warm charcoal / espresso brown surfaces.
- Cream / parchment background for readable administrative content.
- Copper / amber / flame-gold highlights.
- Food photography with restrained usage; operational controls must remain high contrast.
- Serif display typography may be used for the brand/hero only; UI data and controls use a legible sans-serif.
- Brand name always “La Parrilla de Sore”. Do not fabricate a tagline, phone, address, social profile or logo file.
- Build color tokens and components once; avoid hard-coding divergent palettes in each module.

## 5. Initial menu seed (source: user-provided menu image)

All prices are COP integer pesos. Product data must be seedable and editable in admin, not hard-coded into UI components.

| Code | Product | Description | Initial price |
|---|---|---|---:|
| POL-001 | Pollo | 200 g de pollo asado | $13.000 |
| CHU-001 | Chuleta | 1 chuleta de cerdo con hueso | $12.000 |
| CHO-001 | Chorizo | 1 chorizo asado | $10.000 |
| COM-001 | Pollo + Chorizo | 100 g de pollo + 1 chorizo | $15.000 |
| COM-002 | Chuleta + Chorizo | 1 chuleta + 1 chorizo | $14.000 |
| COM-003 | Chuleta + Pollo | 1 chuleta + 100 g de pollo | $16.000 |
| ESP-001 | Parrillada Especial | Chuleta + pollo + chorizo | $20.000 |

All dishes include papa, ensalada and house sauce. The recipe/portion quantities for those accompaniments are **not supplied** and must be configured by the owner before cost/stock calculations use them. Do not guess gram weights, purchase costs or yield.

## 6. Functional modules

### 6.1 Dashboard

Role-aware dashboard. Admin sees daily/monthly sales, order counts, average ticket, sales by payment method, pending supplier debt, low stock, estimated gross margin, expenses and cash status. Seller sees own shift/orders and cash session only. Accountant sees financial/purchase summaries and pending reconciliations. Every KPI links to its underlying filtered records; no fabricated sample figures in production.

### 6.2 Orders / POS

- Create order, add products and quantities, notes, optional customer, channel, table/delivery data when enabled.
- Server-calculated line totals, discounts, taxes (only when configured) and grand total.
- Payment methods and split/partial payments; prevent payment total exceeding outstanding amount unless change/overpayment policy is explicitly defined.
- Unique order number per branch/business sequence.
- Order statuses: `DRAFT`, `CONFIRMED`, `IN_PREPARATION`, `READY`, `DELIVERED`, `CANCELLED`.
- Payment statuses: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `PARTIALLY_REFUNDED`, `REFUNDED`.
- Full timeline of actor/time/status and cancellation reason.
- Reprint receipt; never change historic receipt totals after menu changes.
- Discounts and refunds require permissions and reasons.
- Double submission is prevented through an idempotency key.

### 6.3 Kitchen / Comandas

Separate preparation queue derived from confirmed orders. Show line notes and promised channel/table. Kitchen staff may receive a dedicated least-privilege permission later; initially admin and seller transitions are controlled by role policy. Kitchen status updates must not create a second sale or second stock movement.

### 6.4 Menu and categories

- CRUD with archive (not destructive deletion once referenced).
- Category, code/SKU, name, description, photo, price COP, availability, display order, optional preparation notes.
- Product may reference a recipe. A menu product can be unavailable manually or because ingredients are insufficient, according to a configurable policy.
- Price change applies only to new orders. Existing orders preserve price snapshots.
- Combo/component recipes are explicit; do not infer them from the display name.

### 6.5 Recipes and costing

- Recipe for a sellable menu product is a list of inventory ingredient IDs, base-unit quantities and optional yield/waste factor.
- Cost estimate uses current weighted-average inventory cost; historical order stores cost snapshot at confirmation.
- A dish's sides are ingredients only after quantities/yields are supplied.
- Warn when recipe ingredients are missing, cost is unknown or stock would go negative.

### 6.6 Inventory

- Ingredient/item catalogue with SKU, group, base unit (`g`, `ml`, `unit`), stock, reorder/minimum threshold, average unit cost and active state.
- Stock is a derived total from the opening balance plus append-only movements, or a reconciled cached balance updated transactionally with each movement.
- Movement types: `OPENING`, `PURCHASE_RECEIPT`, `SALE_CONSUMPTION`, `WASTE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `CUSTOMER_RETURN`, `SUPPLIER_RETURN`, `REVERSAL`.
- Require reason and actor for waste/adjustment.
- Low-stock alerts and inventory valuation by current average cost.
- Stock counts/reconciliation with counted quantity, expected quantity, variance and approval.

### 6.7 Suppliers and purchasing

- Supplier profile: legal/commercial name, tax ID (optional pending owner policy), contact, phone, email, address, payment terms, bank/payment reference and notes.
- Purchase invoice: supplier, invoice number, issue/due/received dates, line items linked to inventory, quantity, unit, unit cost, discounts, tax fields only if configured, total, file reference and status.
- Receipt posts stock movements exactly once.
- Accounts payable is derived from posted invoices minus payments and credit notes.
- Partial payments, due dates, aging buckets, payment history and supplier statement.
- Prevent duplicate supplier invoice number within the same business/supplier where invoice number is present.
- Payment cannot exceed outstanding invoice balance without an explicit credit/advance workflow.

### 6.8 Cash register and payments

- Open cash session with opening float and assigned user/register/branch.
- Every cash payment, refund, petty cash expense and cash adjustment records direction, method, amount, source, actor and timestamp.
- Expected closing cash = opening cash + cash inflows − cash outflows. Compare against counted cash and record difference/reason.
- Close only once; closed sessions are immutable except a separately audited correction.
- Enforce one open session per register/branch unless the owner approves another policy.
- Non-cash methods appear in payment reconciliation but do not inflate physical cash.

### 6.9 Expenses

- Expense categories; amount COP; date; payment method; cash session if paid from cash; supplier/payee; optional support document; description; creator and approver.
- Accountant may register expenses. Admin can approve/void according to permission policy.
- An expense is not the same as supplier invoice payment; do not record the same outflow twice.

### 6.10 Staff and roles

- Admin creates seller/accountant accounts; no public sign-up.
- Activate/deactivate, reset password, assign branch, role and permissions.
- Disable access immediately on deactivation; preserve historical actor references.
- Admin cannot remove the last active administrator.
- Sensitive actions logged: role change, price change, discount, refund, stock adjustment, invoice/payment, expense approval, cash close and account deactivation.

### 6.11 Customers (light CRM)

- Optional customer name, phone, notes and order history.
- Customer information is optional for counter sales; do not collect unnecessary personal data.
- No mass marketing or promotional messaging in MVP.

### 6.12 Accounting / management ledger

MVP reports operational income, expenses, supplier liabilities, cash/bank-method summaries, inventory and estimated cost of goods sold. If an internal double-entry ledger is later implemented, each posting must balance debits and credits and be reversible through a linked reversing entry. Tax/VAT/withholding, DIAN electronic invoices, payroll and statutory ledgers require validated requirements from the accountant and remain outside MVP.

### 6.13 Reports

- Sales by period/product/category/seller/order channel/payment method.
- Average ticket, cancellations, refunds, discounts and order throughput.
- Estimated cost of goods sold and gross margin where recipes/costs exist.
- Expenses by category and period.
- Supplier balances, due invoices and aging.
- Inventory stock, value, movement and low-stock list.
- Cash session close summaries and differences.
- CSV export first; PDF reports only when layout is defined.
- Date filters always use `America/Bogota`; report totals reconcile to source records.

### 6.14 Configuration and audit

- Business/branch details, timezone, currency, receipt header/footer, order channels, payment methods, stock-negative policy, discount limits and tax settings.
- Critical settings are permission-protected and audited.
- Audit log is append-only and searchable by actor/date/entity/action.

## 7. Roles and permissions

Use a permission matrix, not scattered `if role === ...` UI checks. Example permission identifiers:

- `dashboard.read.own`, `dashboard.read.all`
- `orders.create`, `orders.read.own`, `orders.read.branch`, `orders.update_status`, `orders.cancel`, `orders.discount`, `orders.refund`
- `menu.read`, `menu.manage`, `recipes.manage`
- `inventory.read`, `inventory.receive`, `inventory.adjust`, `inventory.waste`, `inventory.count.approve`
- `suppliers.read`, `suppliers.manage`, `purchases.create`, `purchases.receive`, `payables.read`, `payables.pay`
- `cash.open`, `cash.read.own`, `cash.read.all`, `cash.movement.create`, `cash.close`, `cash.close.approve`
- `expenses.create`, `expenses.approve`, `reports.sales`, `reports.financial`
- `users.manage`, `settings.manage`, `audit.read`

Baseline:

| Domain | Admin | Seller | Accountant |
|---|---|---|---|
| Dashboard | All | Own shift/orders | Financial/operational reports |
| Orders | All | Create/read own or branch; limited status | Read |
| Menu/recipes | Manage | Read | Read |
| Inventory | Manage | Read/availability only | Read/report |
| Suppliers/purchases | Manage | No access | Manage invoices/payables/payments |
| Cash | All | Own session and allowed movements | Read/reconcile |
| Expenses | Approve/manage | No access | Create/manage per policy |
| Reports | All | Own sales/shift | Sales/financial/inventory |
| Users/settings/audit | Manage | No access | Limited audit/report access |

Before implementation, encode the final matrix as testable constants and test both allowed and denied paths. A seller must not gain financial data by guessing IDs or changing request bodies.

## 8. Technical architecture

### Application shape

Use a **modular monolith** deployed as one Next.js application. Do not split into microservices for this scale.

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui.
- Backend: Next.js Route Handlers under `/api/v1/*`, plus application services invoked by those handlers. Keep transport thin.
- Auth: Better Auth with its MongoDB adapter; disable public registration; staff profiles and the application's permission matrix remain under our control.
- Database: MongoDB Atlas, official Node.js driver. Use a single cached `MongoClient` per Node.js process.
- Validation: Zod server-side at every request boundary.
- Server state: TanStack Query for interactive client queries, cache and mutation state; server components for initial server reads. Avoid duplicating data cache in Zustand.
- Local UI state: Zustand only for temporary POS cart/UI state; persisted drafts may use IndexedDB but are not confirmed orders.
- Forms: React Hook Form + Zod resolver.
- Tables: TanStack Table, with mobile-specific card/list presentation.
- Charts: Recharts for dashboard summaries.
- UI primitives: shadcn/ui (Radix primitives), Lucide icons, Sonner notifications.
- Date utilities: date-fns; all business day calculations explicit in `America/Bogota`.
- Tests: Vitest for unit/integration, Playwright for end-to-end mobile/desktop workflows.
- Monitoring: Sentry optionally after MVP foundations.
- File storage: private object storage for supplier/accounting documents. Public menu imagery can use public image storage. Never assume every uploaded file is public.

### API conventions

- Prefix: `/api/v1`.
- JSON response success: `{ "data": ..., "meta": ... }`.
- JSON response error: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`.
- Validate `params`, query strings and body with Zod.
- Use HTTP status codes consistently (400 validation, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict/idempotency/concurrency, 422 business rule, 429 rate limit, 500 sanitized internal error).
- List endpoints use cursor pagination or bounded page pagination and maximum page size.
- Mutations accept `Idempotency-Key` for sale/order/payment/stock-sensitive POST operations.
- Use request IDs and structured server logs; never log credentials, full payment details or unnecessary personal information.

### Data-access layers

`Route Handler → authentication → permission guard → Zod validation → application service → Mongo repository → response`.

- Route Handlers never construct ad-hoc MongoDB query logic.
- Application services enforce business rules and coordinate transactions.
- Repositories expose typed operations and enforce tenant/branch filters.
- Database connection module is server-only.
- Database validators and unique indexes protect critical structure/uniqueness even if application code regresses.


## 8A. Route/API inventory (implementation contract)

The following is the initial resource map. Exact payload DTOs are defined by Zod schemas in each module; do not build a second divergent API for the same use case.

| Area | Endpoint | Purpose |
|---|---|---|
| Session | `/api/auth/[...all]` | Better Auth login/session/logout |
| Home | `GET /api/v1/dashboard/summary` | Role-scoped dashboard metrics |
| Menu | `GET /api/v1/menu-items` | Search/filter active menu items |
| Menu | `POST /api/v1/menu-items` | Create item (admin permission) |
| Menu | `PATCH /api/v1/menu-items/:id` | Edit item (admin permission; audited) |
| Menu | `POST /api/v1/menu-items/:id/archive` | Archive item; do not delete historical references |
| Categories | `GET/POST /api/v1/menu-categories` | List/create categories |
| Recipes | `GET/POST /api/v1/recipes` | Read/create recipe versions |
| Orders | `GET/POST /api/v1/orders` | List/create order (POST idempotent) |
| Orders | `GET /api/v1/orders/:id` | Read permission-scoped order detail |
| Orders | `POST /api/v1/orders/:id/transitions` | Apply one valid state transition |
| Orders | `POST /api/v1/orders/:id/cancel` | Cancel with reason and reversals |
| Orders | `POST /api/v1/orders/:id/refunds` | Refund/return flow (permission-gated) |
| Payments | `POST /api/v1/orders/:id/payments` | Record payment / split payment (idempotent) |
| Kitchen | `GET /api/v1/kitchen/queue` | Active preparation queue |
| Inventory | `GET/POST /api/v1/inventory/items` | List/create inventory items |
| Inventory | `GET /api/v1/inventory/movements` | Read movement ledger |
| Inventory | `POST /api/v1/inventory/adjustments` | Authorized stock adjustment with reason |
| Inventory | `POST /api/v1/inventory/waste` | Record waste |
| Inventory | `POST /api/v1/inventory/counts` | Start/submit stock count |
| Suppliers | `GET/POST /api/v1/suppliers` | List/create suppliers |
| Suppliers | `PATCH /api/v1/suppliers/:id` | Update supplier profile |
| Purchases | `GET/POST /api/v1/purchase-invoices` | List/create draft invoice |
| Purchases | `POST /api/v1/purchase-invoices/:id/receive` | Post invoice and stock receipt atomically |
| Payables | `GET /api/v1/payables` | Supplier balances / aging |
| Payables | `POST /api/v1/purchase-invoices/:id/payments` | Register partial/full supplier payment |
| Cash | `GET/POST /api/v1/cash/sessions` | List/open cash session |
| Cash | `POST /api/v1/cash/sessions/:id/movements` | Register permitted cash movement |
| Cash | `POST /api/v1/cash/sessions/:id/close` | Close and reconcile session |
| Expenses | `GET/POST /api/v1/expenses` | List/create expense |
| Expenses | `POST /api/v1/expenses/:id/approve` | Approve/post expense |
| Staff | `GET/POST /api/v1/staff` | List/create staff accounts (admin) |
| Staff | `PATCH /api/v1/staff/:id` | Update staff profile/role/branches |
| Reports | `GET /api/v1/reports/sales` | Sales report |
| Reports | `GET /api/v1/reports/inventory` | Stock and movement report |
| Reports | `GET /api/v1/reports/payables` | Supplier payable report |
| Reports | `GET /api/v1/reports/cash` | Cash closing report |
| Audit | `GET /api/v1/audit-logs` | Permission-scoped audit search |
| Settings | `GET/PATCH /api/v1/settings` | Read/update protected business settings |

`GET/POST` shorthand means separate HTTP methods on the same resource path. Implement only endpoints required by the active backlog phase. Do not create placeholder endpoints that return fake data.

## 8B. Domain events and reconciliation

The application services should emit an internal domain event record/outbox entry only when an authoritative transaction commits. Initial event types include:

- `OrderCreated`, `OrderConfirmed`, `OrderStatusChanged`, `OrderCancelled`, `OrderDelivered`
- `PaymentPosted`, `PaymentRefunded`
- `PurchaseInvoiceReceived`, `SupplierPaymentPosted`, `SupplierCreditNotePosted`
- `InventoryMovementPosted`, `StockCountApproved`
- `CashSessionOpened`, `CashMovementPosted`, `CashSessionClosed`
- `ExpensePosted`, `ExpenseVoided`
- `StaffRoleChanged`, `MenuPriceChanged`

Events are for audit, integrations and derived reporting. They are not an alternative source of truth. If an event must trigger a downstream durable action, use an outbox written in the same database transaction and an idempotent processor. A dashboard summary can be rebuilt from source records.

## 8C. Business-rule decisions that must be confirmed before affected backlog items

| Decision | Needed before | Safe baseline |
|---|---|---|
| Actual channels: counter, takeaway, table, delivery | Table/delivery UI | Counter + takeaway only |
| Recipe quantity for potato, salad and house sauce | Recipe/stock consumption | Leave recipe incomplete; no guessed deduction |
| When stock is deducted (order confirm vs kitchen start) | P3-04 | Proposed at confirmation, subject to owner approval |
| Permit negative stock? | P3-03/P3-04 | No, except explicit admin override with audit |
| Discounts and maximum amount | P1-04/P2 | Disabled until permission/limits defined |
| Tax/IVA/withholding treatment | Accounting/tax module | Do not calculate tax until accountant approval |
| Partial payments and delivery tip/charge | P2 | Partial payments supported; no invented delivery fee/tip |
| Receipt header/address/contact | P1-07 | Show only verified business details |
| Printer make/model/connection | Printer integration | Browser print only until real hardware test |

## 9. Recommended folder structure

```text
src/
  app/
    (auth)/login/page.tsx
    (app)/layout.tsx
    (app)/inicio/page.tsx
    (app)/pedidos/page.tsx
    (app)/pedidos/nuevo/page.tsx
    (app)/pedidos/[id]/page.tsx
    (app)/cocina/page.tsx
    (app)/menu/page.tsx
    (app)/inventario/page.tsx
    (app)/proveedores/page.tsx
    (app)/compras/page.tsx
    (app)/caja/page.tsx
    (app)/gastos/page.tsx
    (app)/vendedores/page.tsx
    (app)/clientes/page.tsx
    (app)/contabilidad/page.tsx
    (app)/reportes/page.tsx
    (app)/configuracion/page.tsx
    api/auth/[...all]/route.ts
    api/v1/...
    manifest.ts
  components/
    ui/
    layout/
    feedback/
  modules/
    auth/
    dashboard/
    orders/
    kitchen/
    menu/
    inventory/
    suppliers/
    purchasing/
    cash/
    expenses/
    staff/
    customers/
    accounting/
    reports/
    settings/
  server/
    auth/
    db/
    permissions/
    http/
    audit/
  shared/
    schemas/
    types/
    money/
    dates/
    formatters/
  styles/
  tests/
    unit/
    integration/
    e2e/
  scripts/
    db/
    seed/
docs/
.agents/skills/
```

Keep each module internally organized with `components/`, `schemas/`, `services/`, `repositories/`, `types/` and `tests/` as the module needs. Do not create empty folders for future concepts without implementation.

## 10. PWA and online/offline policy

- Use `app/manifest.ts`, correct application icons, theme color, display `standalone`, HTTPS and an install/help prompt appropriate to browser capabilities.
- Optimize for phone; use responsive layouts rather than a separate mobile codebase.
- Do not cache authenticated HTML, API responses, order data, personal/customer information, supplier invoices, cash data or financial reports in a service worker cache.
- MVP is online-first. If connection is lost, show a persistent offline state and block final order/payment/inventory posting. A local cart draft can be retained locally and clearly labeled “Sin confirmar”.
- Do not automatically replay financial/order mutations after reconnect without an explicit idempotent synchronization design and user confirmation.
- Push notifications and offline order queue are later enhancements, tested on actual Android/iOS target browsers.
- Native printer/Bluetooth behavior must be tested on the target phone/printer; browser print support is not proof that Bluetooth printing works.

## 11. Mobile-first release sequence

Build vertical slices with mobile UI first, then tablet/desktop refinement:

1. Phase 0 — repo, design system, PWA shell, auth, DB connection, permission guard, CI checks.
2. Phase 1 — menu seed + seller POS + order history + status transitions + receipt view.
3. Phase 2 — cash sessions + payment methods + closing reconciliation.
4. Phase 3 — inventory items + recipe definition + stock movement ledger + sale consumption.
5. Phase 4 — supplier catalogue + purchases + receipt + accounts payable + partial payments.
6. Phase 5 — expenses + management accounting + reports.
7. Phase 6 — administration, audit, backups, monitoring, security and production readiness.
8. Later — kitchen real time, advanced offline mode, native app, printer integration, DIAN/statutory accounting after requirements are confirmed.

Each phase must be independently usable and tested before the next begins.

## 12. Production readiness

- Separate development, preview/staging and production databases and secrets.
- Preview deployment must never connect to production data.
- Production database user is least-privilege and has no admin privileges.
- Atlas production tier is selected by measured workload, backup/restore needs and SLA; Free cluster is for development/prototype, not a final business data store.
- Set Vercel region close to the Atlas cluster's cloud region to reduce latency; choose a region based on actual supported locations and Colombian user latency.
- Verify Vercel plan terms for commercial use and cost before launch. Hobby is not the production choice for a commercial restaurant.
- Configure Atlas network access carefully; prefer private networking where the deployment plan supports it, otherwise restrict IP/network access as far as the platform allows and use strong DB credentials.
- Define backup frequency, retention, restore drill and who owns recovery before production.
- Add uptime/health endpoint, logs, error alerting and deployment rollback process.
- Verify current Vercel function duration, WebSocket, Cron, storage and billing limits at implementation time; do not rely on old blog posts.

## 13. Acceptance gate for MVP

The application is not ready merely because screens render. It must pass:

1. Admin creates seller and accountant accounts; public signup is unavailable.
2. Seller logs in on a phone and sees only permitted modules.
3. Seller creates an order for each of the seven seeded products; server calculates totals from database prices.
4. Repeated submit with same idempotency key creates one order and one set of downstream movements.
5. Seller cannot edit menu price, supplier invoice, inventory quantity, financial reports or another seller's restricted record.
6. Admin changes a menu price; historical orders retain original prices.
7. Confirming an order changes stock exactly once only when configured recipes exist; cancellation creates a linked reversal according to the allowed state rules.
8. Purchase receipt increases stock exactly once; duplicate invoice rules work.
9. Supplier invoice $X and payments totaling $Y produce outstanding payable of X−Y; overpayment is rejected.
10. Cash opening, inflows, outflows and closing variance reconcile mathematically.
11. Reports reconcile to orders, payments, expenses, inventory movements and payables for the selected Bogota business day.
12. No protected data can be retrieved by changing an ID or branch identifier in a request.
13. All key screens pass 360 px, 390 px, tablet and desktop checks.
14. Tests, typecheck, lint, production build and smoke deployment pass.
15. Backup and restore procedure is documented and tested before real business transactions.

