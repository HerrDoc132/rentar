import type { Metadata } from 'next';
import './globals.css';
import { Provider } from '@/components/provider';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'RentAr — Gestión de alquileres',
  description: 'Gestión inteligente de alquileres en Tucumán',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={cn("font-sans", geist.variable)}>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
