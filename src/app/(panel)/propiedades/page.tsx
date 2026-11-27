import Link from 'next/link';
import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/propiedades-service';
import { fmtMoneda } from '@/lib/dinero';

export const dynamic = 'force-dynamic';

export default async function PropiedadesPage() {
  const usuario = await requerirPagina();
  const { propiedades } = await listar({
    q: undefined, tipo: undefined, estado: undefined,
    precioMin: undefined, precioMax: undefined,
    habitaciones: undefined, banos: undefined,
    garage: false, page: 1, limit: 100,
  }, usuario);

  return (
    <>
      <h1 className="text-2xl font-bold">Propiedades</h1>
      <p className="mt-1 text-sm text-slate-500">
        {usuario.rol === 'admin' ? 'Todas las propiedades.' : 'Propiedades según tu perfil.'}
      </p>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Dirección</th><th>Tipo</th><th>Precio</th><th>Estado</th><th>Propietario</th><th></th></tr>
          </thead>
          <tbody>
            {propiedades.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.nombre}</td>
                <td>{p.direccion}</td>
                <td>{p.tipo}</td>
                <td>{fmtMoneda(p.precioCentavos)}</td>
                <td><span className="badge bg-slate-100">{p.estado}</span></td>
                <td>{p.propietarioNombre}</td>
                <td><Link href={`/propiedades/${p.id}`} className="text-verde hover:underline">Ver</Link></td>
              </tr>
            ))}
            {propiedades.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Sin propiedades.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
