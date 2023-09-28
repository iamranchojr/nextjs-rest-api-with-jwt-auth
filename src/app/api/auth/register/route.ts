import prisma from '@/lib/db/prisma';
import { getErrorResponse } from '@/lib/helpers';
import {
  RegisterUserInput,
  RegisterUserSchema,
} from '@/lib/validations/user.schema';
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterUserInput;
    const data = RegisterUserSchema.parse(body);

    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        status: 'success',
        data: { ...user, password: undefined },
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error instanceof ZodError) {
      return getErrorResponse(400, 'Failed validations', error);
    }

    if (error.code === 'P2002') {
      return getErrorResponse(409, 'user with that email already exists');
    }

    return getErrorResponse(500, error.message);
  }
}
