import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // 認証ページへのアクセスは常に許可
  if (pathname === '/auth') {
    return NextResponse.next();
  }

  // 認証されていない場合は認証ページにリダイレクト
  if (!authCookie) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth).*)'],
}; 