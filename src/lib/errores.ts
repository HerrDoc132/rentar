import { NextResponse } from 'next/server';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('Error interno:', error);
  return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
}

export const badRequest = (m: string) => new HttpError(400, m);
export const unauthorized = (m = 'No autenticado.') => new HttpError(401, m);
export const forbidden = (m = 'No tenés permiso para acceder a esta sección.') => new HttpError(403, m);
export const notFound = (m: string) => new HttpError(404, m);
export const conflict = (m: string) => new HttpError(409, m);
