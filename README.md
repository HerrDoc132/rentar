# RentAr v2

Aplicación fullstack de gestión de alquileres (Tucumán, Argentina) con **Next.js 16**, **Turso/libSQL** y **Drizzle ORM**. Desplegable en **Vercel Hobby + Turso Free sin costo**.

## Requisitos

- Node.js 24+, npm 11+
- Base Turso (plan Free) o SQLite local para desarrollo

## Arranque rápido

```bash
npm install
cp .env.example .env.local     # completar TURSO_* ; para local ya viene file:./local.db + dummy
npm run db:generate            # solo si cambió src/db/schema.ts
npm run db:migrate
npm run db:seed
npm run dev
```

Abrí http://localhost:3000.

### Cuentas demo

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@gmail.com` | `admin123` |
| Propietario | `jgomez@gmail.com` | `propietario123` |
| Inquilino | `jperez@gmail.com` | `inquilino123` |

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Producción |
| `npm run typecheck` | TypeScript estricto |
| `npm run lint` | ESLint (config plana de Next 16) |
| `npm run db:generate` | Genera migración versionada |
| `npm run db:migrate` | Aplica migraciones |
| `npm run db:studio` | Explorador visual local |
| `npm run db:seed` | Carga datos demo (borra los anteriores) |

## Estructura

```
src/app/api/**        Route Handlers (29 endpoints)
src/app/(publico)     Catálogo y detalle de propiedad
src/app/(auth)        Login y registro
src/app/(panel)       Dashboard y listados por rol
src/db/schema.ts      11 tablas (fuente de verdad)
src/services/         Reglas de negocio
src/lib/              Auth, PDF, Blob, dinero, errores
migrations/           SQL versionado (commitear)
scripts/seed.ts       Datos demo
```

## Variables de entorno

Ver `.env.example`. Nunca commites credenciales reales.

## Documentación

Está en `../../docs/`: `arquitectura.md`, `specs-tecnicas.md`, `guia-creacion-proyectos.md` y `migracion-legacy.md`.
