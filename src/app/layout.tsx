import type { Metadata } from 'next';
import './globals.css';
import { Provider } from '@/components/provider';

export const metadata: Metadata = {
  title: 'RentAr — Gestión de alquileres',
  description: 'Gestión inteligente de alquileres en Tucumán',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
