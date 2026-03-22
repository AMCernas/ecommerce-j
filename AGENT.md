# AGENT.md — E-Commerce de Jardinería, Semillas y Composta

> Guía de contexto y comportamiento para agentes de IA que trabajen en este proyecto.
> Este archivo es independiente de cualquier herramienta específica.

---

## Propósito del proyecto

Plataforma de e-commerce especializada en la venta de **semillas, composta, tierra preparada y accesorios de jardinería**, con operación centrada en Colima, México. El diferenciador principal es un sistema de filtros por recursos del cultivador (nivel de riego, atención requerida, luz solar, espacio) combinado con un calendario de siembra contextualizado por zona climática.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework web | Next.js 15 (App Router, RSC) |
| Estilos | Tailwind CSS + shadcn/ui |
| Estado cliente | Zustand + TanStack Query |
| API / servidor | Hono.js (Node) |
| Contratos tipo-seguros | tRPC |
| Validación | Zod (esquemas compartidos front/back) |
| Base de datos | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Caché / rate limiting | Upstash Redis |
| Autenticación | Supabase Auth (JWT, OAuth, magic link) |
| Pagos | Stripe (tarjeta, OXXO, SPEI, suscripciones) |
| Emails | Resend + React Email |
| Media | Supabase Storage / Cloudinary |
| Monitoreo | Sentry |
| CI/CD | GitHub Actions |
| Lenguaje base | TypeScript (todo el stack) |

---

## Estructura del repositorio

```
/
├── apps/
│   ├── web/          # Next.js storefront (App Router)
│   └── admin/        # Panel de administración
├── packages/
│   ├── api/          # Hono.js + tRPC routers
│   ├── db/           # Drizzle schema, migraciones, seeds
│   ├── ui/           # Componentes compartidos (shadcn/ui base)
│   ├── emails/       # Plantillas React Email
│   └── types/        # Tipos TypeScript compartidos
├── .env.example
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Modelo de datos — tablas principales

### `products`
```sql
id                uuid PK
name              text
slug              text UNIQUE          -- URL SEO-friendly
category          text                 -- semilla | tierra | composta | accesorio
subcategory       text                 -- hortaliza | flor | árbol | hierba | ornamental
is_organic        boolean
climate_zones     text[]               -- índice GIN
sow_months        int[]                -- meses 1–12, índice GIN
harvest_months    int[]
water_needs       int                  -- 1 (poco) | 2 (moderado) | 3 (frecuente)
sun_needs         int                  -- 1 (sombra) | 2 (sol parcial) | 3 (sol pleno)
care_level        int                  -- 1 (mínimo) | 2 (semanal) | 3 (seguimiento)
space_needed      text                 -- maceta_pequeña | maceta_grande | jardín | campo
germination_rate  decimal              -- porcentaje garantizado
days_to_germinate int
days_to_harvest   int
weight_options    jsonb                -- [{g: 50, price: 35.00}, ...]
images            text[]
seo_title         text
seo_description   text
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

### Otras tablas clave
- `users` — extiende `auth.users` de Supabase; incluye `climate_zone` y `role`
- `orders` — status: `pending | paid | shipped | delivered | refunded`
- `order_items` — con `variant_g` para la presentación elegida
- `addresses` — con RLS `user_id = auth.uid()`
- `reviews` — con `verified_purchase` marcado desde webhook de Stripe
- `subscriptions` — suscripciones recurrentes vía Stripe Subscriptions
- `discount_codes` — tipo `percentage | fixed_mxn`
- `audit_logs` — solo INSERT, retención 90 días

---

## Índices críticos de PostgreSQL

```sql
CREATE INDEX idx_products_climate   ON products USING GIN(climate_zones);
CREATE INDEX idx_products_sow       ON products USING GIN(sow_months);
CREATE INDEX idx_products_resources ON products(water_needs, care_level, sun_needs);
CREATE INDEX idx_products_category  ON products(category, is_organic);
```

---

## Seguridad — reglas no negociables

1. **RLS activo en todas las tablas con datos de usuario.** Nunca desactivarlo, ni siquiera temporalmente en desarrollo.
2. **La `service_role` key de Supabase nunca va al cliente.** Solo en variables de entorno del servidor.
3. **Todo input pasa por Zod antes de llegar a la base de datos.** Sin excepciones.
4. **Los webhooks de Stripe siempre se verifican** con `stripe.webhooks.constructEvent()` y `STRIPE_WEBHOOK_SECRET`.
5. **Nunca almacenar datos de tarjeta.** Stripe Elements maneja todo; el servidor solo recibe `payment_intent_id`.
6. **IDs expuestos en URLs son siempre UUIDs v4.** Nunca IDs secuenciales.
7. **Rate limiting en todos los endpoints de auth:** máximo 5 intentos cada 15 minutos por IP.
8. **Variables de entorno:** separar `NEXT_PUBLIC_*` (cliente, no sensible) de variables server-only (nunca al cliente).

### Cabeceras HTTP obligatorias (next.config.js)
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Convenciones de código

### Nombrado
- Archivos y carpetas: `kebab-case`
- Componentes React: `PascalCase`
- Funciones y variables: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`
- Tipos e interfaces TypeScript: `PascalCase` con prefijo `T` para tipos, `I` no se usa

### Imports
- Paths absolutos desde la raíz del package (`@/components/...`)
- Sin imports relativos que suban más de un nivel (`../../`)

### Commits (Conventional Commits)
```
feat:     nueva funcionalidad
fix:      corrección de bug
chore:    configuración, dependencias, scripts
docs:     documentación
test:     tests nuevos o modificados
refactor: refactoring sin cambio de comportamiento
perf:     mejora de rendimiento
```

### TypeScript
- `strict: true` siempre activo
- Sin `any` explícito — usar `unknown` y narrowing
- Zod como fuente de verdad de tipos en la frontera API: `z.infer<typeof schema>`
- Drizzle como fuente de verdad de tipos en la frontera BD: `InferSelectModel<typeof table>`

---

## Patrones de desarrollo establecidos

### Server Actions vs API Routes
- **Server Actions:** mutaciones desde componentes de servidor (formularios, acciones simples)
- **Hono API routes:** lógica de negocio compleja, webhooks externos, endpoints que necesitan rate limiting

### Fetching de datos
- Datos públicos del catálogo: RSC + caché de Next.js (`revalidate: 60` en ISR)
- Datos del usuario autenticado: TanStack Query en cliente
- Mutaciones: optimistic updates con TanStack Query + rollback en error

### Manejo de errores
- Errores de validación (Zod): respuesta 400 con detalle de campos fallidos
- Errores de autenticación: respuesta 401, redirigir a login
- Errores de autorización (RLS): respuesta 403, sin exponer detalles
- Errores de servidor: capturar con Sentry, respuesta 500 genérica al cliente
- Nunca exponer stack traces ni mensajes de error internos en producción

### Testing
- Unitario (Vitest): lógica de negocio pura — cálculos de carrito, validaciones, transformaciones
- Integración (Vitest + Supabase local): queries a BD, flujos de auth
- E2E (Playwright): flujo completo de compra, checkout, gestión de cuenta
- Cobertura mínima en rutas críticas: carrito, checkout, pagos, autenticación → 80%

---

## Filtros especializados — lógica de negocio

Los filtros de recursos son el diferenciador principal. Al construir o modificar el sistema de filtrado:

```typescript
// Tipos de los filtros de recursos
type WaterNeeds = 1 | 2 | 3;   // 1=poco, 2=moderado, 3=frecuente
type SunNeeds   = 1 | 2 | 3;   // 1=sombra, 2=sol parcial, 3=sol pleno
type CareLevel  = 1 | 2 | 3;   // 1=mínimo, 2=semanal, 3=seguimiento
type SpaceNeeded = 'maceta_pequeña' | 'maceta_grande' | 'jardín' | 'campo';

// Zonas climáticas soportadas
type ClimateZone =
  | 'costera_humeda'   // Colima, Jalisco costa, Veracruz
  | 'seca_calida'      // Sonora, Baja California
  | 'templada'         // CDMX, Puebla, Querétaro
  | 'fria_montana';    // Estado de México, partes de Jalisco
```

Al filtrar por recursos, usar `<=` no `=` para mayor cobertura:
- `water_needs <= 2` devuelve productos de riego bajo Y moderado
- Solo usar `= 1` cuando el usuario seleccione explícitamente "solo bajo mantenimiento"

---

## Contexto de negocio — decisiones clave

| Decisión | Elección | Razón |
|---|---|---|
| ¿Guest checkout? | Sí, obligatorio | Reduce fricción; mayor conversión en primera compra |
| ¿Método de pago prioritario? | OXXO visible al frente | Gran parte del mercado MX sin tarjeta bancaria |
| ¿IDs en URLs? | UUIDs v4 | Seguridad — sin enumeración de pedidos |
| ¿Precios? | MXN únicamente | Operación local; evitar complejidad multi-moneda |
| ¿Fotos de reseñas? | Sí, con upload a Supabase Storage | Principal social proof para semillas (ver el cultivo logrado) |
| ¿Suscripciones? | Fase 3 (no MVP) | Requiere confianza establecida con el cliente |
| ¿Mayoreo B2B? | Fase 3 (no MVP) | Requiere operación rodada y masa crítica |

---

## Variables de entorno esperadas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # solo servidor

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=                  # solo servidor
STRIPE_WEBHOOK_SECRET=              # solo servidor

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=                     # solo servidor

# Cloudinary (opcional, si no se usa Supabase Storage)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=              # solo servidor

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=                  # solo CI/CD
```

---

## Lo que NO hacer en este proyecto

- No usar `any` en TypeScript
- No desactivar RLS en Supabase "temporalmente"
- No exponer la `service_role` key en el cliente bajo ninguna circunstancia
- No almacenar datos de tarjeta, ni siquiera temporalmente
- No usar IDs secuenciales en URLs expuestas al usuario
- No hacer fetch de datos sensibles del usuario en Server Components sin verificar sesión
- No saltarse la validación con Zod por "rapidez" en desarrollo
- No mezclar lógica de negocio en componentes de UI — mantener separación en `/server`
- No lanzar features de fase 2 o 3 antes de validar el MVP con ventas reales
- No usar `console.log` en producción — usar el logger configurado con Sentry
