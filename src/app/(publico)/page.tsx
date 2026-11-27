import Link from 'next/link';
import { listar } from '@/services/propiedades-service';
import { fmtMoneda } from '@/lib/dinero';

export const dynamic = 'force-dynamic';

export default async function Catalogo() {
  const { propiedades } = await listar({
    q: undefined, tipo: undefined, estado: undefined,
    precioMin: undefined, precioMax: undefined,
    habitaciones: undefined, banos: undefined,
    garage: false, page: 1, limit: 12,
  }, null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-navy">RentAr</h1>
          <p className="mt-2 text-slate-600">Alquileres en Tucumán · {propiedades.length} propiedades disponibles</p>
        </div>
        <nav className="flex gap-3">
          <Link href="/login" className="btn-outline">Ingresar</Link>
          <Link href="/registro" className="btn-primary">Crear cuenta</Link>
        </nav>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {propiedades.map((p) => (
          <Link key={p.id} href={`/propiedades/${p.id}`} className="card overflow-hidden hover:shadow-md transition">
            <div className="h-40 bg-slate-100 flex items-center justify-center text-5xl">🏠</div>
            <div className="p-4">
              <span className="badge bg-green-100 text-green-800">{p.tipo}</span>
              <h2 className="mt-2 text-lg font-semibold">{p.nombre}</h2>
              <p className="text-sm text-slate-500">{p.direccion}</p>
              <p className="mt-3 text-xl font-bold text-verde">{fmtMoneda(p.precioCentavos)}<span className="text-sm font-normal text-slate-500"> /mes</span></p>
              <p className="mt-2 text-xs text-slate-500">{p.habitaciones} hab · {p.banos} baños · {p.garage ? 'Garage' : 'Sin garage'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
