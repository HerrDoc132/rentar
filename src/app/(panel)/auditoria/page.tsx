import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/auditoria-service';

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  await requerirPagina(true);
  const filas = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Auditoría</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>Usuario</th><th>Acción</th><th>Fecha</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.id}>
                <td className="font-medium">{f.usuario}</td><td>{f.accion}</td>
                <td>{f.creadoEn?.toLocaleString('es-AR') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
