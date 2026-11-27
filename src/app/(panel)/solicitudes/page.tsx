import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/solicitudes-service';

export const dynamic = 'force-dynamic';

export default async function SolicitudesPage() {
  await requerirPagina(true);
  const filas = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Solicitudes</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>#</th><th>Propiedad</th><th>Visitante</th><th>Email</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            {filas.map(({ solicitud: s, propiedadNombre }) => (
              <tr key={s.id}>
                <td className="font-medium">#{s.id}</td><td>{propiedadNombre}</td>
                <td>{s.visitanteNombre ?? 'Usuario registrado'}</td><td>{s.visitanteEmail ?? '—'}</td>
                <td><span className="badge bg-slate-100">{s.estado}</span></td>
                <td>{s.creadoEn?.toLocaleString('es-AR') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
