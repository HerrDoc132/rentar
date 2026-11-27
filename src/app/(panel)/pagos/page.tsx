import { requerirPagina } from '@/lib/pagina';
import { listar as listarPagos } from '@/services/pagos-service';
import { fmtMoneda } from '@/lib/dinero';

export const dynamic = 'force-dynamic';

export default async function PagosPage() {
  const usuario = await requerirPagina();
  const pagos = await listarPagos(usuario);

  return (
    <>
      <h1 className="text-2xl font-bold">Pagos</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead>
            <tr><th>#</th><th>Propiedad</th><th>Inquilino</th><th>Mes</th><th>Monto</th><th>Interés</th><th>Estado</th><th>Recibo</th></tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">#{p.id}</td>
                <td>{p.propiedadNombre}</td>
                <td>{p.inquilinoNombre}</td>
                <td>{p.mes}</td>
                <td>{fmtMoneda(p.montoCentavos)}</td>
                <td>{p.interesCentavos ? fmtMoneda(p.interesCentavos) : '—'}</td>
                <td><span className="badge bg-slate-100">{p.estado}</span></td>
                <td>
                  {p.estado === 'pagado'
                    ? <a href={`/api/pagos/${p.id}/recibo`} className="text-verde hover:underline">PDF</a>
                    : <span className="text-slate-400">—</span>}
                </td>
              </tr>
            ))}
            {pagos.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-slate-500">Sin pagos.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
