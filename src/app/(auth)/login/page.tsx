'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { setUsuario } from '@/app/store';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'No se pudo iniciar sesión.');
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
      <h1 className="text-2xl font-bold text-navy">Ingresar a RentAr</h1>
      <p className="mt-1 text-sm text-slate-500">Usá tu cuenta para acceder al panel.</p>

      <form onSubmit={entrar} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">Contraseña</label>
          <input id="password" type="password" className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿No tenés cuenta? <Link href="/registro" className="font-medium text-verde hover:underline">Registrate</Link>
      </p>
      <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Demo: <strong>admin@gmail.com</strong> / admin123
      </div>
    </>
  );
}
