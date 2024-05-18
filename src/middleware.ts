import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from './lib/supabase/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const signInURL = new URL('/admin/sign-in', req.url)
  const dashboardURL = new URL('/admin/dashboard', req.url)

  if (!session) {
    if (req.nextUrl.pathname === '/login') {
      return res
    }

    return NextResponse.redirect(signInURL)
  }

  if (req.nextUrl.pathname === '/admin/sign-in') {
    return NextResponse.redirect(dashboardURL)
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
