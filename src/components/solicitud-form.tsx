'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SolicitudForm({ propiedadId }: { propiedadId: number }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje('');
    setLoading(true);
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propiedadId,
          visitanteNombre: nombre || null,
          visitanteEmail: email || null,
        }),
      });
      const data = await res.json();
      setMensaje(res.ok ? '¡Listo! Te vamos a contactar pronto.' : (data.error ?? 'No se pudo enviar.'));
      if (res.ok) { setNombre(''); setEmail(''); }
    } catch {
      setMensaje('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={enviar} className="card mt-6 space-y-3 p-5">
      <h2 className="text-lg font-semibold">Quiero consultar por esta propiedad</h2>
      <div className="space-y-1.5">
        <Label htmlFor="solicitud-nombre">Nombre (opcional)</Label>
        <Input id="solicitud-nombre" placeholder="Tu nombre" value={nombre}
          onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="solicitud-email">Email (opcional)</Label>
        <Input id="solicitud-email" type="email" placeholder="tu@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)} />
      </div>
      {mensaje && <p className="text-sm text-verde">{mensaje}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </Button>
    </form>
  );
}
