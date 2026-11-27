import { NextResponse } from 'next/server';
import { login } from '@/services/auth-service';
import { errorResponse } from '@/lib/errores';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await login(body));
  } catch (error) {
    return errorResponse(error);
  }
}
