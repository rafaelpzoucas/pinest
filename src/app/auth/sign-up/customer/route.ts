import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const response = setTimeout(() => {
    return true
  }, 2000)

  if (response) {
    return NextResponse.redirect(`${origin}/sign-up?confirm=success`)
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
