'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  async function salir() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <Button onClick={salir} variant="outline" size="sm">
      Cerrar sesión
    </Button>
  );
}
