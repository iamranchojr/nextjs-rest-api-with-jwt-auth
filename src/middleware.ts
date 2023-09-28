import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './lib/token';
import { getErrorResponse } from './lib/helpers';

interface AuthenticatedRequest extends NextRequest {
  user: { id: string };
}

export async function middleware(req: NextRequest) {
  let token: string | undefined;

  if (req.headers.get('Authorization')?.startsWith('Bearer')) {
    token = req.headers.get('Authorization')?.substring(7);
  }

  if (
    !token &&
    (req.nextUrl.pathname.startsWith('/api/users') ||
      req.nextUrl.pathname.startsWith('/api/auth/logout'))
  ) {
    return getErrorResponse(
      401,
      'You are not logged in. Please provide a token to gain access.',
    );
  }

  const response = NextResponse.next();

  try {
    if (token) {
      const { sub } = await verifyJWT<{ sub: string }>(token);
      response.headers.set('X-USER-ID', sub);
      (req as AuthenticatedRequest).user = { id: sub };
    }
  } catch (error) {
    return getErrorResponse(401, "Token is invalid or user doesn't exists");
  }

  return response;
}

export const config = {
  matcher: ['/profile', '/login', '/api/users/:path*', '/api/auth/logout'],
};
