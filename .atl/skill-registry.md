# Skill Registry — E-Commerce Jardinería

## Proyecto
- **Nombre**: ecommerce-jardineria
- **Stack principal**: Next.js 15 + Supabase + Stripe + Hono/tRPC
- **Fase**: MVP (semanas 1-8)

## Skills Disponibles (heredados del workspace global)
Ubicación: `C:\Users\elect\.config\opencode\skills\`

| Skill | Propósito |
|-------|-----------|
| sdd-init | Inicializar contexto SDD en proyecto |
| sdd-explore | Investigar ideas antes de implementar |
| sdd-propose | Crear propuesta de cambio |
| sdd-spec | Escribir especificaciones (delta specs) |
| sdd-design | Documento técnico de diseño |
| sdd-tasks | Desglose en tareas implementables |
| sdd-apply | Implementar tareas desde specs |
| sdd-verify | Validar implementación contra specs |
| sdd-archive | Archivar cambio completado |
| go-testing | Patrones de testing para Go |
| skill-creator | Crear nuevas skills |

## Artefactos del Proyecto
- `AGENT.md` — Guía de contexto y comportamiento para agentes IA
- `PRD.md` — Product Requirements Document

## Convenciones del Proyecto (de AGENT.md)
- Commits: Conventional Commits (feat, fix, chore, docs, test, refactor, perf)
- Nombrado: kebab-case (archivos), PascalCase (componentes React), camelCase (funciones)
- TypeScript: strict mode, sin any, Zod como fuente de tipos en API
- Arquitectura: Server Actions para mutaciones simples, Hono API para lógica compleja/webhooks
- RLS obligatorio en todas las tablas de Supabase

## Última actualización
2026-03-19
