import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-3xl font-bold text-navy">RentAr</Link>
      <div className="card w-full max-w-md p-8">{children}</div>
      <p className="mt-6 text-sm text-slate-500">Gestión inteligente de alquileres · Tucumán</p>
    </main>
  );
}
