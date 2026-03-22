# Proposal: MVP E-Commerce Jardinería — Plan de Implementación

## Intent

Implementar el MVP del e-commerce de jardinería, semillas y composta operando en Colima, México. El plan seqüencia 10 cambios interdependentés que cubren: setup de infraestructura, modelo de datos, APIs, storefront y admin panel.

**Meta del MVP**: 50 órdenes completadas en el primer mes, checkout < 30% abandono, 50+ productos catalogados.

## Scope

### Objetivo general
E-commerce funcional con catálogo de productos, carrito, checkout (OXXO/SPEI/tarjeta), autenticación, panel admin y emails transaccionales.

### Resultado esperado
- Storefront público: Home, Catálogo (PLP), Página de producto (PDP)
- Checkout completo con 3 métodos de pago mexicanos
- Auth: email/password + Google OAuth + magic link
- Admin: CRUD productos, gestión de órdenes, inventario, descuentos
- Emails: confirmación de orden, actualización de estado, bienvenida

---

## Cambios seqüenciados (Dependency Order)

### Fase 0: Infraestructura Base

#### 0.1 `setup-monorepo`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Bootstrap del monorepo pnpm con Next.js 15, configuración de workspaces, variables de entorno |
| **Entregables** | Estructura apps/packages, turbo.json, pnpm-workspace.yaml, .env.example, tsconfig base |
| **Dependencias** | Ninguna |
| **Riesgo** | Bajo |

#### 0.2 `setup-supabase`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Proyecto Supabase, conexión DB, RLS policies base, auth configurado |
| **Entregables** | Supabase project linkeado, auth providers (email, Google), RLS en tables base |
| **Dependencias** | setup-monorepo |
| **Riesgo** | Medio (depende de cuenta Supabase existente) |

---

### Fase 1: Modelo de Datos

#### 1.1 `database-schema`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Schema Drizzle completo con todas las tablas del PRD |
| **Entregables** | `packages/db/schema/*.ts`, migraciones, índices GIN, seeds iniciales |
| **Dependencias** | setup-supabase |
| **Riesgo** | Medio |
| **Tablas** | users, products, orders, order_items, addresses, reviews, subscriptions, discount_codes, audit_logs |

#### 1.2 `database-seeds`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Seeds con 50+ productos con atributos agronómicos completos |
| **Entregables** | Seed script con productos de ejemplo (semillas, tierra, composta, accesorios) |
| **Dependencias** | database-schema |
| **Riesgo** | Bajo |

---

### Fase 2: API Base

#### 2.1 `api-auth`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Sistema de autenticación completo con Supabase Auth |
| **Entregables** | tRPC routers: register, login, logout, magic-link, OAuth callback, profile, delete-account |
| **Dependencias** | database-schema |
| **Riesgo** | Medio (seguridad crítica) |

#### 2.2 `api-products`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | CRUD de productos y categorías con filtros básicos |
| **Entregables** | tRPC routers: products.list, products.get, products.getBySlug, categories.list |
| **Dependencias** | database-schema |
| **Riesgo** | Bajo |

#### 2.3 `api-cart-orders`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Carrito y órdenes con validación de stock |
| **Entregables** | tRPC routers: cart.get, cart.add, cart.update, cart.remove, orders.create, orders.get, orders.list |
| **Dependencias** | api-products, api-auth |
| **Riesgo** | Medio (lógica de inventario compleja) |

---

### Fase 3: Pagos

#### 3.1 `api-payments`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Integración Stripe con OXXO, SPEI y tarjeta |
| **Entregables** | Endpoints: stripe.create-payment-intent, stripe.create-oxxo-voucher, stripe.webhook, stripe.get-clabe |
| **Dependencias** | api-cart-orders |
| **Riesgo** | Alto (manejo de dinero real) |
| **Notas** | Idempotency keys obligatorios, verificación de webhooks, nunca guardar datos de tarjeta |

---

### Fase 4: Storefront Público

#### 4.1 `storefront-home`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Página home con hero, colecciones, productos destacados |
| **Entregables** | Componentes: Hero, FeaturedProducts, CollectionsGrid, TrustBadges, Newsletter |
| **Dependencias** | api-products |
| **Riesgo** | Bajo |

#### 4.2 `storefront-catalog`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Catálogo PLP con grid, filtros, paginación, búsqueda |
| **Entregables** | Página /catalogo, componentes: ProductGrid, ProductCard, FiltersSidebar, SearchBar |
| **Dependencias** | api-products |
| **Riesgo** | Bajo |

#### 4.3 `storefront-pdp`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Página de producto con galería, variantes, datos agronómicos |
| **Entregables** | Página /producto/[slug], componentes: ImageGallery, VariantSelector, AgronomicData, AddToCart |
| **Dependencias** | api-products |
| **Riesgo** | Medio |

#### 4.4 `storefront-cart-checkout`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Carrito drawer y checkout completo |
| **Entregables** | MiniCartDrawer, página /checkout con AddressForm, PaymentMethods, OrderSummary |
| **Dependencias** | api-cart-orders, api-payments |
| **Riesgo** | Alto (flujo crítico de conversión) |

#### 4.5 `storefront-account`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Cuenta de usuario con auth, historial, direcciones, wishlist |
| **Entregables** | Páginas: /cuenta, /cuenta/pedidos, /cuenta/direcciones, /cuenta/wishlist |
| **Dependencias** | api-auth, api-cart-orders |
| **Riesgo** | Medio |

---

### Fase 5: Admin Panel

#### 5.1 `admin-auth`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Auth específico para admin con verificación de rol |
| **Entregables** | Middleware de verificación de rol admin, login admin dedicado |
| **Dependencias** | api-auth |
| **Riesgo** | Alto (seguridad del panel) |

#### 5.2 `admin-products`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | CRUD completo de productos con atributos agronómicos |
| **Entregables** | Tabla de productos, formulario de creación/edición, gestión de variantes, imágenes |
| **Dependencias** | admin-auth, api-products |
| **Riesgo** | Medio |

#### 5.3 `admin-orders`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Gestión de órdenes con cambio de estado y guía de envío |
| **Entregables** | Dashboard de órdenes, detalle de orden, actualización de estado, envío de emails automáticos |
| **Dependencias** | admin-auth, api-cart-orders |
| **Riesgo** | Medio |

#### 5.4 `admin-discounts`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Gestión de códigos de descuento |
| **Entregables** | CRUD de descuentos, validación en checkout |
| **Dependencias** | admin-auth |
| **Riesgo** | Bajo |

---

### Fase 6: Integración Final

#### 6.1 `emails-transactional`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Emails transaccionales con Resend + React Email |
| **Entregables** | Plantillas: order-confirmation, order-status-update, welcome, password-reset |
| **Dependencias** | api-cart-orders, api-payments |
| **Riesgo** | Bajo |

#### 6.2 `seo-technical`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | SEO técnico base: metadata dinámica, schema markup, sitemap |
| **Entregables** | generateMetadata en PDP/PLP, JSON-LD Product schema, sitemap.xml, robots.txt |
| **Dependencias** | storefront-catalog, storefront-pdp |
| **Riesgo** | Bajo |

#### 6.3 `whatsapp-integration`
| Aspecto | Detalle |
|---------|---------|
| **Intención** | Botón flotante de WhatsApp Business |
| **Entregables** | Componente WhatsAppButton fijo en viewport |
| **Dependencias** | Ninguna |
| **Riesgo** | Bajo |

---

## Diagrama de Dependencias

```
setup-monorepo
    └── setup-supabase
            └── database-schema
                    ├── database-seeds
                    ├── api-auth
                    │       └── admin-auth
                    ├── api-products
                    │       ├── storefront-home
                    │       ├── storefront-catalog
                    │       ├── storefront-pdp
                    │       └── admin-products
                    └── api-cart-orders
                            ├── api-payments
                            │       ├── storefront-cart-checkout
                            │       └── emails-transactional
                            ├── storefront-account
                            └── admin-orders
                                    └── admin-discounts
                                    
seo-technical (depende de storefront-*)
whatsapp-integration (independiente)
```

---

## Rollback Plan

Cada cambio es independiente y reversible vía:
1. Git revert del commit del change
2. Migration rollback si hay cambios de BD
3. Feature flags para disable sin deploy

---

## Criterios de Éxito del MVP

- [ ] 50+ productos con atributos agronómicos completos en BD
- [ ] Checkout completable con OXXO, SPEI y tarjeta
- [ ] Tasa de abandono de checkout < 30%
- [ ] 90% de órdenes procesadas automáticamente
- [ ] Emails transaccionales enviados < 2 min post-pago
- [ ] Panel admin funcional para gestión de productos y órdenes
- [ ] RLS activo y verificado en todas las tablas

---

## Estimación de Esfuerzo

| Fase | Cambios | Complejidad |
|------|---------|-------------|
| Infraestructura | 2 | Media |
| Modelo de Datos | 2 | Media |
| API Base | 3 | Alta |
| Pagos | 1 | Alta |
| Storefront | 5 | Alta |
| Admin | 4 | Media |
| Integración | 3 | Baja |
| **Total** | **20 cambios** | **~8 semanas** |

---

## Próximo Paso

Iniciar con `/sdd-continue setup-monorepo` para comenzar la implementación del primer cambio.
