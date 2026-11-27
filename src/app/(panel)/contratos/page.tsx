import { requerirPagina } from '@/lib/pagina';
import { listar as listarContratos } from '@/services/contratos-service';
import { fmtMoneda } from '@/lib/dinero';

export const dynamic = 'force-dynamic';

export default async function ContratosPage() {
  const usuario = await requerirPagina();
  const contratos = await listarContratos(usuario);

  return (
    <>
      <h1 className="text-2xl font-bold">Contratos</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead>
            <tr><th>#</th><th>Propiedad</th><th>Inquilino</th><th>Inicio</th><th>Fin</th><th>Monto</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">#{c.id}</td>
                <td>{c.propiedadNombre}</td>
                <td>{c.inquilinoNombre}</td>
                <td>{c.fechaInicio}</td>
                <td>{c.fechaFin}</td>
                <td>{fmtMoneda(c.montoCentavos)}</td>
                <td><span className="badge bg-slate-100">{c.estado}</span></td>
              </tr>
            ))}
            {contratos.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">Sin contratos.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
