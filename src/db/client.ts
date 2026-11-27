import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as relations from './relations';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL ?? 'file:./local.db';

// El cliente Node soporta tanto libsql:// (Turso) como file: (SQLite local).
// En Vercel se usa el runtime Node, por lo que no hace falta el build web.
const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// libSQL no activa foreign keys por defecto; se habilita también en local.
void client.execute('PRAGMA foreign_keys = ON;');

export const db = drizzle({ client, schema: { ...schema, ...relations } });
