import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // El driver de libSQL para web es compatible con el runtime de Node de Vercel.
  serverExternalPackages: ['@libsql/client'],
};

export default nextConfig;
