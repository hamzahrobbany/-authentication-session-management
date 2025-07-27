// middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    // Middleware hanya lanjut jika user sudah login
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Jika token ada, berarti user sudah login
        return !!token;
      },
    },
  }
);

// Hanya jalankan middleware untuk route /dashboard dan turunannya
export const config = {
  matcher: ['/dashboard/:path*'],
};
