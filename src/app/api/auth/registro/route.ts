import { NextResponse } from 'next/server';
import { registrar } from '@/services/auth-service';
import { errorResponse } from '@/lib/errores';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resultado = await registrar(body);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
