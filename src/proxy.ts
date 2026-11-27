import { NextResponse, type NextRequest } from 'next/server';

const RUTAS_PROTEGIDAS = [
  '/dashboard', '/propiedades', '/contratos', '/pagos',
  '/inquilinos', '/propietarios', '/solicitudes',
  '/alertas', '/usuarios', '/auditoria',
];

/** Chequeo rápido de cookie; la validación real contra la DB está en requerirPagina(). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protegida = RUTAS_PROTEGIDAS.some((r) => pathname === r || pathname.startsWith(r + '/'));
  if (protegida && !request.cookies.get('rentar_sesion')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
