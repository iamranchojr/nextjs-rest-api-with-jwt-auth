import prisma from '@/lib/db/prisma';
import { getEnvVariable, getErrorResponse } from '@/lib/helpers';
import { signJWT } from '@/lib/token';
import { LoginUserInput, LoginUserSchema } from '@/lib/validations/user.schema';
import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginUserInput;
    const data = LoginUserSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await compare(data.password, user.password))) {
      return getErrorResponse(401, 'Invalid email or password');
    }

    const JWT_EXPIRES_IN = getEnvVariable('JWT_EXPIRES_IN');

    const token = await signJWT(
      { sub: user.id },
      { exp: `${JWT_EXPIRES_IN}m` },
    );

    const response = NextResponse.json(
      { status: 'success', token },
      { status: 200 },
    );

    return response;
  } catch (error: any) {
    if (error instanceof ZodError) {
      return getErrorResponse(400, 'failed validations', error);
    }

    return getErrorResponse(500, error.message);
  }
}
