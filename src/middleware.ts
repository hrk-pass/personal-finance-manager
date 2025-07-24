import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が不要なパス
const publicPaths = ['/auth', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証が不要なパスの場合はスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 静的ファイルへのアクセスはスキップ
  if (
    pathname.includes('._next') || // Next.jsの静的ファイル
    pathname.includes('/static/') || // 静的ファイル
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) // 一般的な静的ファイル
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 