import { requerirPagina } from '@/lib/pagina';
import { listar } from '@/services/usuarios-service';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage() {
  await requerirPagina(true);
  const usuarios = await listar();

  return (
    <>
      <h1 className="text-2xl font-bold">Usuarios y roles</h1>
      <p className="mt-1 text-sm text-slate-500">Las cuentas nuevas entran como «pendiente» hasta que les asignes un rol.</p>
      <div className="card mt-6 overflow-x-auto">
        <table>
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Activo</th><th>Último acceso</th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.nombre}</td><td>{u.email}</td>
                <td><span className="badge bg-slate-100">{u.rol}</span></td>
                <td>{u.activo ? 'Sí' : 'No'}</td>
                <td>{u.ultimoAcceso?.toLocaleString('es-AR') ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
