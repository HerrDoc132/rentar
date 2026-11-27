import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/propietarios-service';

export const dynamic = 'force-dynamic';

export default async function PropietariosPage() {
  await requerirPagina(true);
  const propietarios = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Propietarios</h1>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>Nombre</th><th>DNI</th><th>Teléfono</th><th>Email</th></tr></thead>
          <tbody>
            {propietarios.map((p) => (
              <tr key={p.id}>
                <td className="font-medium">{p.nombre}</td><td>{p.dni}</td>
                <td>{p.telefono ?? '—'}</td><td>{p.email ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
