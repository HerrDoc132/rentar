/**
 * Verifica las variables de entorno necesarias para desplegar RentAr.
 * NUNCA imprime los valores: solo el nombre de la variable y el resultado.
 *
 * Uso: npm run env:check
 * En local carga .env.local si existe; en Vercel las variables ya vienen inyectadas.
 * Si no hay TURSO_DATABASE_URL, se asume el fallback file:./local.db de src/db/client.ts.
 */
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const urlDefinida = process.env.TURSO_DATABASE_URL !== undefined && process.env.TURSO_DATABASE_URL !== '';
const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const token = process.env.TURSO_AUTH_TOKEN ?? '';
const blob = process.env.BLOB_READ_WRITE_TOKEN ?? '';
const esReal = url.startsWith('libsql://');

const errores: string[] = [];
const avisos: string[] = [];

console.log(`Entorno detectado: ${esReal ? 'Turso remoto (producción)' : 'SQLite local (desarrollo)'}`);
if (!esReal && !url.startsWith('file:')) {
  errores.push('TURSO_DATABASE_URL debe empezar con libsql:// o file:');
}
if (esReal && token.trim() === '') {
  errores.push('TURSO_AUTH_TOKEN no está definida');
}
if (esReal && token.trim() === 'dummy') {
  errores.push('TURSO_AUTH_TOKEN sigue siendo el placeholder "dummy"');
}
if (esReal && blob.trim() === '') {
  errores.push('BLOB_READ_WRITE_TOKEN no está definida');
}
if (!esReal && blob.trim() === '') {
  avisos.push('BLOB_READ_WRITE_TOKEN vacía: la subida de imágenes no funcionará en local');
}

const estado = (nombre: string, definida: boolean, requerida: boolean) => {
  const marca = definida ? '✓' : requerida ? '✗' : '·';
  const texto = definida ? 'definida' : requerida ? 'falta' : 'no requerida en local';
  console.log(`  ${marca} ${nombre}: ${texto}`);
};

if (urlDefinida) console.log('  ✓ TURSO_DATABASE_URL: definida');
else console.log('  · TURSO_DATABASE_URL: usa fallback file:./local.db');
estado('TURSO_AUTH_TOKEN', token.trim() !== '', esReal);
estado('BLOB_READ_WRITE_TOKEN', blob.trim() !== '', esReal);

for (const aviso of avisos) console.log(`Aviso: ${aviso}`);

if (errores.length > 0) {
  console.error('No se puede desplegar:');
  for (const error of errores) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('OK: el entorno tiene las variables mínimas. No se mostraron valores.');
