# 🌱 Jardín Verde — E-Commerce de Jardinería

Tienda en línea especializada en semillas, tierra y composta para cultivation en México. Enfocada en Colima con datos agronómicos y calendarios de siembra regionalizados.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS |
| **Monorepo** | pnpm, Turborepo |
| **Base de datos** | PostgreSQL (Supabase), Drizzle ORM |
| **Auth** | Supabase Auth (email, Google OAuth) |
| **Pagos** | Stripe (OXXO, SPEI, Tarjeta) |
| **Email** | Resend |
| **API** | tRPC, Hono (REST endpoints) |
| **Testing** | Vitest |

## 📁 Estructura del Proyecto

```
ecommerce/
├── apps/
│   ├── web/                 # Frontend Next.js (storefront + checkout)
│   │   └── src/
│   │       ├── app/         # Rutas (pages)
│   │       ├── components/  # Componentes React
│   │       ├── lib/        # Utilidades, actions
│   │       └── store/      # Estado (Zustand)
│   │
│   └── admin/              # Panel de administración
│       └── src/
│           ├── app/        # Rutas admin
│           ├── components/  # Componentes admin
│           └── lib/        # tRPC client, Supabase client
│
├── packages/
│   ├── api/                # API tRPC + Hono REST
│   │   └── src/
│   │       ├── routers/    # tRPC routers (auth, products, orders, discounts)
│   │       ├── routes/     # Hono REST routes (payments, webhooks)
│   │       └── utils/      # Helpers (discount validation, order status)
│   │
│   ├── db/                # Schema Drizzle + seeds
│   │   └── src/
│   │       ├── schema/     # Tablas (users, products, orders, etc.)
│   │       ├── seeds/      # Datos de prueba
│   │       └── client.ts   # DB client
│   │
│   ├── stripe/            # Lógica de Stripe
│   ├── emails/            # Templates de email transaccional
│   └── types/             # Tipos TypeScript compartidos
│
└── pnpm-workspace.yaml
```

## 🚀 Empezar

### Requisitos

- Node.js 20+
- pnpm 8+
- Cuenta de Supabase (para BD y Auth)
- Cuenta de Stripe (para pagos)
- Cuenta de Resend (para emails)

### Setup

1. **Clonar el repositorio**
```bash
git clone https://github.com/AMCernas/ecommerce-j.git
cd ecommerce-j
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**

Copiar `.env.example` a `.env.local` y completar:

```bash
cp .env.example .env.local
```

Variables requeridas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_APP_URL=http://localhost:3001
```

4. **Setup de Base de Datos**

```bash
# Generar migrations desde schema
cd packages/db
pnpm db:generate

# Push schema a Supabase
pnpm db:push

# Seed datos de prueba
pnpm db:seed
```

5. **Ejecutar en desarrollo**

```bash
# Todos los apps en modo dev
pnpm dev

# O individual
pnpm --filter @ecoomerce-jardineria/web dev
pnpm --filter @ecoomerce-jardineria/admin dev
pnpm --filter @ecoomerce-jardineria/api dev
```

### Ports

| App | URL |
|-----|-----|
| Web (Storefront) | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API (tRPC) | http://localhost:3000/api/trpc |
| API Hono (REST) | http://localhost:3000/api/* |

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev                  # Todos los apps
pnpm dev --filter web     # Solo storefront

# Build
pnpm build                # Build producción
pnpm --filter api build   # Build API

# Testing
pnpm test                 # Todos los tests
pnpm --filter api test    # Solo API
pnpm --filter web test    # Solo web

# Database
pnpm --filter @ecoomerce-jardineria/db db:generate   # Generar migrations
pnpm --filter @ecoomerce-jardineria/db db:push      # Push a Supabase
pnpm --filter @ecoomerce-jardineria/db db:seed      # Seed datos
pnpm --filter @ecoomerce-jardineria/db db:studio    # Drizzle Studio
```

## 🔑 Endpoints Principales

### tRPC (Storefront → Admin)

| Router | Procedimiento | Descripción |
|--------|--------------|-------------|
| `products` | `list` | Listar productos con filtros |
| `products` | `getBySlug` | Producto por slug (PDP) |
| `products` | `create` | Crear producto (admin) |
| `products` | `update` | Actualizar producto (admin) |
| `orders` | `create` | Crear orden |
| `orders` | `getById` | Orden por ID |
| `orders` | `getUserOrders` | Órdenes del usuario |
| `orders` | `updateStatus` | Cambiar status (admin) |
| `orders` | `updateTracking` | Agregar tracking (admin) |
| `discounts` | `validate` | Validar código de descuento |
| `discounts` | `list` | Listar descuentos (admin) |

### REST (Stripe Webhooks)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/webhooks/stripe` | POST | Webhook de Stripe |
| `/api/payments/create-intent` | POST | Crear Payment Intent |
| `/api/payments/oxxo-voucher` | POST | Generar voucher OXXO |

## 🗄️ Schema de Base de Datos

### Tablas Principales

- `users` — Usuarios con roles (cliente, admin, mayoreo)
- `products` — Catálogo con atributos agronómicos
- `orders` — Órdenes con status y metadata
- `order_items` — Items de cada orden
- `discount_codes` — Códigos de descuento
- `payment_events` — Eventos de pago (Stripe)

### Roles de Usuario

| Rol | Acceso |
|-----|--------|
| `cliente` | Storefront, checkout, mi cuenta |
| `admin` | Panel admin completo |
| `mayoreo` | Precios mayoreo (Fase 3) |

## 💳 Métodos de Pago

- **OXXO** — Voucher para pagar en tienda (válido 3 días)
- **SPEI** — Transferencia con CLABE (válido 72 horas)
- **Tarjeta** — Débito/crédito via Stripe Elements

## 📧 Emails Transaccionales

- Confirmación de orden
- Actualización de estado
- Bienvenida (nuevo usuario)

## 🔒 Seguridad

- Row Level Security (RLS) en todas las tablas
- JWT con claims de rol
- Rate limiting en auth y checkout
- HTTPS obligatorio

## 📈 Estados de Orden

```
pending → paid → shipped → delivered
                   ↘ refunded
pending → failed → cancelled
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests con watch
pnpm test:watch

# Coverage
pnpm test -- --coverage
```

## 📚 Documentación Adicional

- [PRD.md](./PRD.md) — Product Requirements Document completo
- [.atl/](./.atl/) — Artefactos SDD (specs, designs, tasks)

## 🤝 Contributing

1. Crear branch desde `main`
2. Implementar cambios siguiendo SDD workflow
3. Asegurar que tests pasan
4. Crear PR con descripción clara

## 📄 Licencia

Privado — Uso interno.
