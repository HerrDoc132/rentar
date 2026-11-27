import Link from 'next/link';
import { requerirPagina, esAdmin } from '@/lib/pagina';
import { LogoutButton } from '@/components/logout-button';

const enlaces = [
  { href: '/dashboard', label: 'Resumen' },
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/contratos', label: 'Contratos' },
  { href: '/pagos', label: 'Pagos' },
  { href: '/inquilinos', label: 'Inquilinos', admin: true },
  { href: '/propietarios', label: 'Propietarios', admin: true },
  { href: '/solicitudes', label: 'Solicitudes', admin: true },
  { href: '/alertas', label: 'Alertas', admin: true },
  { href: '/usuarios', label: 'Usuarios', admin: true },
  { href: '/auditoria', label: 'Auditoría', admin: true },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const usuario = await requerirPagina();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <Link href="/dashboard" className="text-xl font-bold text-navy">RentAr</Link>
            <p className="text-xs text-slate-500">Panel de gestión · Tucumán</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {usuario.nombre} <span className="badge ml-1 bg-slate-100">{usuario.rol}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="w-52 shrink-0">
          <nav className="card flex flex-col gap-1 p-2">
            {enlaces.filter((e) => !e.admin || esAdmin(usuario)).map((e) => (
              <Link key={e.href} href={e.href} className="rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
                {e.label}
              </Link>
            ))}
            <Link href="/" className="mt-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
              ← Catálogo público
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
