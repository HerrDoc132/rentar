import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getById } from '@/services/propiedades-service';
import { fmtMoneda } from '@/lib/dinero';
import { SolicitudForm } from '@/components/solicitud-form';

export const dynamic = 'force-dynamic';

export default async function DetallePropiedad({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let propiedad;
  try {
    propiedad = await getById(Number(id));
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-slate-500 hover:underline">← Volver al catálogo</Link>
      <div className="card mt-4 overflow-hidden">
        <div className="flex h-64 items-center justify-center bg-slate-100 text-7xl">🏠</div>
        <div className="p-6">
          <span className="badge bg-green-100 text-green-800">{propiedad.tipo}</span>
          <h1 className="mt-3 text-3xl font-bold">{propiedad.nombre}</h1>
          <p className="mt-1 text-slate-600">{propiedad.direccion}</p>
          <p className="mt-4 text-3xl font-bold text-verde">
            {fmtMoneda(propiedad.precioCentavos)} <span className="text-base font-normal text-slate-500">/ mes</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>🛏 {propiedad.habitaciones} habitaciones</span>
            <span>🚿 {propiedad.banos} baños</span>
            <span>🚗 {propiedad.garage ? 'Garage' : 'Sin garage'}</span>
            <span>📍 {propiedad.propietarioNombre}</span>
          </div>
        </div>
      </div>
      <SolicitudForm propiedadId={propiedad.id} />
    </main>
  );
}
