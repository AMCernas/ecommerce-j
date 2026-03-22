# PRD — E-Commerce de Jardinería, Semillas y Composta

**Versión:** 1.0  
**Fecha:** 2025  
**Clasificación:** Uso interno  
**Estado:** Aprobado para desarrollo

---

## 1. Visión del producto

Una tienda de e-commerce especializada en jardinería que resuelve el problema central que ningún competidor mexicano resuelve bien: **el comprador sabe lo que quiere lograr, pero no sabe qué producto necesita**. Alguien en Colima con un balcón pequeño y poco tiempo no busca "Lycopersicon esculentum variedad cherry" — busca "algo fácil de sembrar que quepa en una maceta y no necesite riego diario".

El producto traduce esa intención en resultados concretos mediante filtros por recursos del cultivador, datos agronómicos en cada ficha, y un calendario de siembra contextualizado por zona climática.

---

## 2. Problema que resuelve

### Problema del comprador
1. **Desorientación por catálogo genérico.** Los competidores listan productos sin contexto de uso: sin indicar cuánto riego necesitan, qué tanto espacio requieren, o si son adecuados para la temporada actual en su zona.
2. **Miedo a que las semillas no germinen.** Sin datos de tasa de germinación ni garantías explícitas, la compra se percibe como un riesgo.
3. **Falta de adecuación geográfica.** Los calendarios de siembra disponibles son genéricos para el centro del país — no sirven para el clima cálido-húmedo de Colima.

### Problema del mercado
Los competidores directos en México (Agrorganicos.mx, Semillas ISLA, Semillas Las Huertas) operan con catálogos estáticos y experiencia de usuario básica. Ninguno integra filtros por nivel de mantenimiento, calendario regional, ni reseñas verificadas con evidencia del cultivo logrado.

---

## 3. Usuarios objetivo

### Perfil primario — Cultivador urbano principiante
- **Quién:** Persona de 25–45 años en ciudad, sin experiencia formal en jardinería
- **Contexto:** Tiene balcón, jardín pequeño o quiere empezar a compostar en casa
- **Motivación:** Autosuficiencia parcial, hobby, alimentación saludable
- **Dolor principal:** No sabe qué sembrar, cuándo, ni cuánto cuidado requiere
- **Comportamiento:** Busca en Google "qué sembrar en [mes] en [ciudad]"; compara por precio y facilidad

### Perfil secundario — Jardinero intermedio recurrente
- **Quién:** Persona con experiencia básica que ya tiene huerto o jardín establecido
- **Contexto:** Recompra tierra, composta y semillas cada temporada
- **Motivación:** Mejorar resultados, explorar variedades nuevas, reducir costos de insumos
- **Dolor principal:** Encontrar semillas de calidad con alta tasa de germinación, no genéricas de tienda de abarrotes
- **Comportamiento:** Compra por volumen, valora las reseñas de otros cultivadores, busca variedades específicas

### Perfil terciario — Comprador mayoreo B2B (Fase 3)
- **Quién:** Vivero pequeño, restaurante con huerto, escuela con programa de jardinería
- **Contexto:** Necesita volúmenes medianos con factura y precio diferenciado
- **Motivación:** Proveedor confiable con buen producto y logística para Colima y alrededores
- **Dolor principal:** Los proveedores actuales no tienen tienda online con self-service para mayoreo

---

## 4. Objetivos del producto

### Fase 1 — MVP (semanas 1–8)
| Objetivo | Métrica de éxito |
|---|---|
| Tienda funcional con primeras ventas | 50 órdenes completadas en el primer mes |
| Checkout sin fricción en México | Tasa de abandono de checkout < 30% |
| Catálogo inicial catalogado correctamente | 50+ productos con atributos agronómicos completos |
| Operación básica sin intervención manual | 90% de órdenes procesadas automáticamente |

### Fase 2 — Diferenciación (semanas 9–16)
| Objetivo | Métrica de éxito |
|---|---|
| Filtros de recursos en uso activo | 40%+ de sesiones usan al menos un filtro de recurso |
| Reseñas con foto generando confianza | 20+ reseñas verificadas con foto en los primeros 3 meses |
| Tráfico orgánico creciendo | 500+ visitas orgánicas/mes desde contenido de blog |
| Tasa de conversión mejorada | Conversión storefront → orden > 2.5% |

### Fase 3 — Escala (semanas 17–24)
| Objetivo | Métrica de éxito |
|---|---|
| Suscripciones recurrentes activas | 30+ suscriptores activos de composta / tierra |
| Canal mayoreo operativo | 5+ clientes B2B con pedidos mensuales |
| LTV de cliente creciendo | LTV promedio > $800 MXN (vs ticket único) |

---

## 5. Alcance del producto

### 5.1 Incluido en Fase 1 (MVP)

#### Storefront público
- **Home:** Hero estacional, colecciones destacadas, productos más vendidos, sección de confianza (garantías, envíos), newsletter
- **Catálogo / PLP:** Grid de productos, filtros básicos (categoría, precio, es orgánico), ordenamiento, paginación
- **Página de producto / PDP:** Galería de imágenes, variantes por peso/presentación, datos agronómicos completos, información de envío, stock en tiempo real, botón de añadir al carrito
- **Búsqueda:** Búsqueda por nombre y descripción con resultados relevantes
- **Carrito:** Mini-drawer persistente, edición de cantidades, barra de progreso de envío gratis, resumen de orden
- **Checkout:** Dirección de envío, selección de método de pago (OXXO, SPEI, tarjeta), resumen final, guest checkout sin registro obligatorio
- **Confirmación de orden:** Resumen detallado, número de seguimiento, email transaccional automático

#### Cuenta de usuario
- Registro, login, recuperación de contraseña
- OAuth con Google
- Historial de pedidos con estado actualizado
- Gestión de direcciones guardadas
- Wishlist básica

#### Panel de administración
- CRUD de productos con todos los atributos agronómicos
- Gestión de órdenes (ver, cambiar estado, notas internas)
- Gestión básica de inventario (stock por variante)
- Configuración de códigos de descuento
- Configuración de zonas y tarifas de envío

#### Infraestructura y operación
- Emails transaccionales: confirmación de orden, actualización de estado, bienvenida
- WhatsApp Business: botón flotante visible en todo el sitio
- SEO técnico base: metadata dinámica, sitemap XML, schema Product básico
- Política de envíos y devoluciones como página estática

### 5.2 Incluido en Fase 2

- Filtros avanzados por zona climática y mes de siembra actual
- Filtros por recursos del cultivador: nivel de riego, atención requerida, luz solar, espacio
- Calculadora de cobertura de tierra y composta por m²
- Kits y bundles curados por objetivo (huerto en balcón, inicio de compostaje, jardín polinizador)
- Reseñas verificadas con foto de cultivo, vinculadas a compra confirmada
- Garantía de germinación explícita en PDP con porcentaje mínimo
- Blog / guías de cultivo con SEO: artículos por temporada y zona
- Programa de puntos básico por compra
- Búsqueda mejorada con soporte para consultas en lenguaje natural

### 5.3 Incluido en Fase 3

- Suscripciones recurrentes para composta, tierra y humus (Stripe Subscriptions)
- Canal mayoreo B2B con precios escalonados por volumen y facturación automática
- Asistente de siembra con IA: recomendaciones por zona, mes y nivel de experiencia
- Comunidad / foro de jardineros con notificaciones en tiempo real
- Dashboard de analytics avanzado con métricas de LTV, retención y conversión por producto

### 5.4 Fuera de alcance (todas las fases)

- Aplicación móvil nativa (el sitio es mobile-first con PWA como alternativa futura)
- Marketplace de terceros (vendedores externos)
- Venta de plantas vivas (solo semillas, tierra, composta y accesorios)
- Envíos internacionales (solo México en etapas iniciales)
- Integración con ERP o sistemas de inventario externos en MVP

---

## 6. Requerimientos funcionales

### 6.1 Catálogo y filtros

**RF-001 — Atributos agronómicos por producto**
Cada producto de tipo semilla debe tener campos obligatorios: `germination_rate`, `days_to_germinate`, `days_to_harvest`, `sow_months[]`, `climate_zones[]`. El admin no puede publicar un producto de tipo semilla sin estos campos.

**RF-002 — Filtros de recursos (Fase 2)**
El catálogo debe permitir filtrar simultáneamente por: nivel de riego (1–3), nivel de atención (1–3), necesidad de luz (1–3) y espacio requerido (enum). Los filtros deben ser acumulativos (AND) y actualizarse sin recarga de página.

**RF-003 — Filtro por zona climática y mes**
El sistema debe detectar o permitir seleccionar la zona climática del usuario y filtrar automáticamente los productos sembrables en el mes actual de esa zona. El filtro debe ser explicable al usuario: "Mostrando productos sembrables en noviembre en zona costera".

**RF-004 — Variantes de producto**
Los productos de tierra, composta y semillas deben soportar múltiples presentaciones por peso (50g, 250g, 1kg, costal 20kg) con precio y stock independiente por variante.

**RF-005 — Stock en tiempo real**
La disponibilidad de cada variante debe mostrarse en el PDP y actualizarse en tiempo real. Si stock < 5 unidades, mostrar "Últimas [n] unidades disponibles". Si stock = 0, deshabilitar el botón de compra y ofrecer lista de espera.

### 6.2 Carrito y checkout

**RF-006 — Persistencia del carrito**
El carrito debe persistir entre sesiones para usuarios autenticados (guardado en BD). Para usuarios no autenticados, persistir en localStorage hasta 7 días o hasta completar el checkout.

**RF-007 — Guest checkout**
El checkout debe ser completable sin registro. Al finalizar la orden se debe ofrecer la opción de crear cuenta con los datos ya ingresados, sin volver a solicitarlos.

**RF-008 — Métodos de pago México**
El checkout debe ofrecer en orden de prominencia: OXXO (pago en efectivo), SPEI (transferencia), tarjeta de débito/crédito. Los tres deben estar disponibles desde el MVP.

**RF-009 — Envío gratis por monto**
Configurar umbral de envío gratis desde el panel admin (por defecto $1,000 MXN). Mostrar barra de progreso en el carrito indicando cuánto falta para alcanzarlo.

**RF-010 — Idempotencia en pagos**
Cada intento de pago debe incluir un `idempotency_key` único para prevenir cobros duplicados en caso de reintentos de red o navegación hacia atrás.

### 6.3 Autenticación y cuenta

**RF-011 — Autenticación**
Soportar: email + contraseña, Google OAuth, magic link por email. La contraseña mínima es 10 caracteres. Sin requisitos de caracteres especiales (dificultan acceso sin mejorar seguridad real).

**RF-012 — Roles de usuario**
Tres roles: `cliente` (acceso a storefront y cuenta), `admin` (acceso a panel de administración), `mayoreo` (acceso a precios escalonados en Fase 3). Los roles se asignan desde el panel admin y se incluyen en el JWT claim.

**RF-013 — Preferencias de zona**
Al registrarse o en la configuración de cuenta, el usuario puede seleccionar su zona climática. Esta preferencia personaliza las recomendaciones del catálogo y las sugerencias de siembra.

### 6.4 Administración

**RF-014 — Gestión de productos**
El admin puede crear, editar y archivar productos. Archivar no elimina el producto (mantiene historial de órdenes). Los productos archivados no aparecen en el storefront pero son accesibles desde el panel.

**RF-015 — Gestión de órdenes**
El admin puede ver todas las órdenes, filtrarlas por estado, cambiar el estado manualmente, agregar número de guía de envío (que se comunica al cliente por email automáticamente) y agregar notas internas visibles solo en el admin.

**RF-016 — Códigos de descuento**
El admin puede crear códigos con tipo (porcentaje o monto fijo en MXN), monto mínimo de orden, límite de usos totales y fecha de expiración. Los códigos son case-insensitive al aplicarlos en el carrito.

---

## 7. Requerimientos no funcionales

### Rendimiento
- **LCP** (Largest Contentful Paint): < 2.5 segundos en conexión 4G
- **INP** (Interaction to Next Paint): < 200 ms en interacciones de catálogo y carrito
- **CLS** (Cumulative Layout Shift): < 0.1 en todas las páginas
- Páginas de catálogo regeneradas con ISR cada 60 segundos
- Caché de catálogo en Redis con TTL de 5 minutos e invalidación selectiva al actualizar

### Disponibilidad
- Uptime objetivo: 99.5% mensual (Supabase Pro garantiza 99.9% en BD)
- Mantenimiento programado solo en horarios de baja actividad (2–5 AM hora Colima)

### Seguridad
- TLS 1.3 obligatorio; sin soporte de TLS 1.0/1.1
- Cabeceras HTTP de seguridad completas (CSP, HSTS, X-Frame-Options)
- RLS activo en todas las tablas con datos de usuario
- Rate limiting en endpoints de autenticación y checkout
- Cumplimiento LFPDPPP: aviso de privacidad, consentimiento explícito, endpoint de eliminación de datos

### SEO
- Metadata dinámica (title, description, og:image) en cada PDP y página de categoría
- Schema markup JSON-LD tipo `Product` con precio, disponibilidad y reseñas
- Sitemap XML generado automáticamente y enviado a Google Search Console
- URLs canónicas en todas las variantes de producto

### Accesibilidad
- WCAG 2.1 nivel AA como objetivo mínimo
- Componentes con soporte completo de teclado y lectores de pantalla (Radix UI / shadcn/ui)
- Contraste de texto mínimo 4.5:1

---

## 8. Experiencia de usuario — principios

### Principio 1: El comprador no debería necesitar saber el nombre científico
La navegación y los filtros deben permitir llegar al producto correcto describiendo la situación del comprador, no el producto. "Tengo un balcón con sol de la tarde y poco tiempo" debe llevarte a semillas con `sun_needs=2`, `care_level=1` y `space_needed='maceta_pequeña'`.

### Principio 2: Confianza antes de la compra
Las semillas son productos que generan desconfianza en compradores nuevos ("¿germinarán?"). Cada PDP debe responder activamente esa pregunta: tasa de germinación visible, reseñas con fotos de cultivos reales, garantía explícita.

### Principio 3: Checkout sin obstáculos
No pedir registro antes del pago. No sorprender con costos de envío al final. Mostrar el total real desde el carrito. El checkout debe ser completable en menos de 3 minutos.

### Principio 4: México primero
OXXO visible y prominente. Precios en MXN. Formato de dirección mexicano. WhatsApp como canal de soporte natural. Contenido relevante para el clima y los meses del año en México.

---

## 9. Criterios de aceptación por módulo

### PDP (Página de producto)
- [ ] Muestra nombre, descripción, precio por variante seleccionada
- [ ] Galería con al menos una imagen; navegable con teclado
- [ ] Selector de variante por peso actualiza precio y stock en tiempo real
- [ ] Datos agronómicos visibles: tasa de germinación, días a germinación, días a cosecha (solo semillas)
- [ ] Indicador de zona climática compatible y meses de siembra (solo semillas)
- [ ] Botón "Añadir al carrito" deshabilitado si stock = 0 con opción de lista de espera
- [ ] Sección de reseñas con promedio de calificación visible

### Checkout
- [ ] Completable sin cuenta registrada (guest checkout)
- [ ] Validación en tiempo real de todos los campos de dirección
- [ ] Método OXXO disponible y explica el proceso (voucher, pago en tienda, 3 días de vigencia)
- [ ] Método SPEI disponible con CLABE visible post-orden
- [ ] Resumen de orden visible durante todo el proceso sin abandonar el flujo
- [ ] Email de confirmación enviado en menos de 2 minutos tras completar el pago
- [ ] No hay forma de crear una orden duplicada por doble click o recarga de página

### Panel de administración
- [ ] Crear producto con todos los atributos en un solo formulario
- [ ] Actualizar stock de una variante sin afectar las demás
- [ ] Cambiar estado de una orden y que el cliente reciba email automáticamente
- [ ] Agregar número de guía de envío y que el cliente pueda verlo en "Mis pedidos"
- [ ] Crear código de descuento con todas sus restricciones en menos de 1 minuto

---

## 10. Dependencias y riesgos

### Dependencias externas
| Dependencia | Criticidad | Mitigación |
|---|---|---|
| Supabase (BD + Auth) | Crítica | Plan Pro con SLA 99.9%; backups diarios automáticos |
| Stripe (pagos) | Crítica | Sin alternativa equivalente en MX; monitorear status.stripe.com |
| Carrier de envíos (Estafeta, DHL, J&T) | Alta | Integrar 2 carriers desde el inicio para fallback |
| Resend (emails) | Media | Fácilmente reemplazable por SendGrid si falla |

### Riesgos principales
| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Datos agronómicos incorrectos en fichas | Media | Alto | Revisión por experto en horticultura antes de publicar; fuentes: INIFAP, SAGARPA |
| Alta tasa de abandono por métodos de pago | Media | Alto | OXXO prominente desde el día 1; prueba A/B de orden de métodos |
| Daño en envío de productos a granel | Alta | Medio | Embalaje reforzado; política de reemplazo sin fricción |
| Temporalidad de semillas afecta inventario | Alta | Medio | Alertas de stock bajo en admin; lista de espera automática |
| Incumplimiento LFPDPPP | Baja | Muy alto | Aviso de privacidad revisado legalmente; consentimiento explícito; endpoint DELETE /account |

---

## 11. Criterios de transición entre fases

### De Fase 1 a Fase 2
La transición a Fase 2 se aprueba cuando se cumplen **todos** los siguientes criterios:
- 50 órdenes completadas y entregadas con éxito
- Tasa de abandono de checkout estable < 35%
- Catálogo con mínimo 50 productos completamente catalogados (atributos agronómicos incluidos)
- Operación estable durante 30 días consecutivos sin incidentes críticos

### De Fase 2 a Fase 3
La transición a Fase 3 se aprueba cuando se cumplen **todos** los siguientes criterios:
- 200 órdenes acumuladas completadas
- Al menos 30 reseñas verificadas publicadas
- Tráfico orgánico > 300 visitas/mes desde búsqueda
- Al menos 5 clientes con 3+ órdenes (señal de recurrencia natural antes de implementar suscripciones)

---

## 12. Glosario

| Término | Definición en el contexto del proyecto |
|---|---|
| PLP | Product Listing Page — página de catálogo con listado de múltiples productos |
| PDP | Product Detail Page — página individual de un producto |
| RSC | React Server Components — componentes renderizados en servidor en Next.js |
| ISR | Incremental Static Regeneration — regeneración estática incremental de Next.js |
| RLS | Row Level Security — seguridad a nivel de fila en PostgreSQL/Supabase |
| Variante | Presentación específica de un producto (ej: semilla de tomate en sobre de 50g) |
| Tasa de germinación | Porcentaje de semillas del lote que germinan bajo condiciones estándar |
| Zona climática | Clasificación del clima de la región del comprador (costera húmeda, seca cálida, etc.) |
| Care level | Nivel de atención requerida por el cultivo, escala 1–3 (1 = mínima, 3 = seguimiento activo) |
| Water needs | Frecuencia de riego requerida, escala 1–3 (1 = poco, 3 = diario) |
| LTV | Lifetime Value — valor total de las compras de un cliente a lo largo del tiempo |
| LFPDPPP | Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México) |
