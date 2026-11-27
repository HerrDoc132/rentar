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
| `npm run env:check` | Verifica variables mínimas sin mostrar valores |

## Deploy en Vercel Hobby (gratis)

1. Crear la DB en **Turso Free** y dejar los **overages desactivados** en el panel (sin tarjeta, $0/mes).
2. Crear un store de **Vercel Blob FREE**.
3. En local: `cp .env.example .env.local`, completar `TURSO_DATABASE_URL=libsql://...`, `TURSO_AUTH_TOKEN` y `BLOB_READ_WRITE_TOKEN`. Ejecutar `npm run env:check` (no muestra los valores).
4. Aplicar schema y datos contra Turso: `npm run db:migrate` y `npm run db:seed`.
5. Importar el repo en **Vercel Hobby**. Framework: Next.js; no hace falta configurar Root Directory porque la raíz del repo ya es `repositories/rentar`.
6. Cargar en Vercel las mismas tres variables de entorno. **Nunca commitear `.env.local`**.
7. Verificar post-deploy: catálogo público, login con cada rol y descarga del recibo PDF.

Guía paso a paso en `../../docs/guia-creacion-proyectos.md`. Las variables de correo (Resend) se documentan en SCRUM-19.

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
scripts/verificar-entorno.ts  Chequeo de variables (sin secretos)
```

## Variables de entorno

Ver `.env.example`. Nunca commites credenciales reales.

## Documentación

Está en `../../docs/`: `arquitectura.md`, `specs-tecnicas.md`, `guia-creacion-proyectos.md` y `migracion-legacy.md`.
