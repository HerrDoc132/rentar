import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/inquilinos-service';

export const dynamic = 'force-dynamic';

export default async function InquilinosPage() {
  await requerirPagina(true);
  const inquilinos = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Inquilinos</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Email</th><th>Estado</th></tr></thead>
          <tbody>
            {inquilinos.map((i) => (
              <tr key={i.id}>
                <td className="font-medium">{i.nombre}</td><td>{i.dni}</td>
                <td>{i.telefono ?? '—'}</td><td>{i.email ?? '—'}</td>
                <td><span className="badge bg-slate-100">{i.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
