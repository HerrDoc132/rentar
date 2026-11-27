import { requerirPagina } from '@/lib/pagina';
import { getStats } from '@/services/dashboard-service';
import { fmtMoneda } from '@/lib/dinero';

export const dynamic = 'force-dynamic';

const etiquetas: Record<string, string> = {
  propiedades: 'Propiedades',
  disponibles: 'Disponibles',
  contratosActivos: 'Contratos activos',
  proximosVencer: 'Próximos a vencer',
  pagosPendientes: 'Pagos pendientes',
  pagosAtrasados: 'Pagos atrasados',
  ingresosCobrados: 'Ingresos cobrados',
  totalPagado: 'Total pagado',
  alertasNuevas: 'Alertas nuevas',
  solicitudesNuevas: 'Solicitudes nuevas',
};

export default async function DashboardPage() {
  const usuario = await requerirPagina();
  const stats = await getStats(usuario);

  return (
    <>
      <h1 className="text-2xl font-bold">Resumen</h1>
      <p className="mt-1 text-sm text-slate-500">
        Datos correspondientes a tu perfil: <strong>{usuario.rol}</strong>.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(stats).map(([clave, valor]) => (
          <div key={clave} className="card p-5">
            <p className="text-sm text-slate-500">{etiquetas[clave] ?? clave}</p>
            <p className="mt-2 text-3xl font-bold text-navy">
              {clave.toLowerCase().includes('pagado') || clave === 'ingresosCobrados'
                ? fmtMoneda(Number(valor))
                : Number(valor).toLocaleString('es-AR')}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
