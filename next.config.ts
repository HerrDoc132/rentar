import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // El runtime Node de Vercel usa @libsql/client (libsql:// o file:); se externaliza.
  serverExternalPackages: ['@libsql/client'],
};

export default nextConfig;
