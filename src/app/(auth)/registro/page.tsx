'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setUsuario } from '@/app/store';

export default function RegistroPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function registrarse(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'No se pudo crear la cuenta.');
        return;
      }
      dispatch(setUsuario(data.usuario));
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-navy">Crear cuenta</h1>
      <p className="mt-1 text-sm text-slate-500">Tu cuenta queda pendiente hasta que un admin te asigne un rol.</p>

      <form onSubmit={registrarse} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="nombre">Nombre</label>
          <input id="nombre" className="input" value={nombre}
            onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Contraseña (mínimo 6 caracteres)</label>
          <input id="password" type="password" className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-verde w-full">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta? <Link href="/login" className="font-medium text-verde hover:underline">Ingresá</Link>
      </p>
    </>
  );
}
