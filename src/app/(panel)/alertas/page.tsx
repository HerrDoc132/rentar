import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/alertas-service';

export const dynamic = 'force-dynamic';

export default async function AlertasPage() {
  await requerirPagina(true);
  const alertas = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Alertas</h1>
      <div className="mt-6 space-y-3">
        {alertas.map((a) => (
          <div key={a.id} className={`card flex items-center justify-between p-4 ${a.leido ? 'opacity-60' : ''}`}>
            <div>
              <span className="badge bg-slate-100">{a.tipo}</span>
              <p className="mt-1 font-medium">{a.mensaje}</p>
              <p className="text-sm text-slate-500">{a.detalle ?? ''}</p>
            </div>
            <span className="text-xs text-slate-400">{a.leido ? 'Leída' : 'Nueva'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
