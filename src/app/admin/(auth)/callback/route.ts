import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { readOwner } from '../../(protected)/(app)/actions'
import { createOwner } from '../../(protected)/onboarding/actions'

export async function GET(request: Request) {
  const supabase = createClient()

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: session, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !session?.user) {
    return NextResponse.redirect('/admin/sign-in')
  }

  const { owner, ownerError } = await readOwner()

  if (ownerError) {
    console.error(ownerError)
  }

  if (!owner) {
    const { createOwnerError } = await createOwner()

    if (createOwnerError) {
      console.error(createOwnerError)
    }
  }

  return NextResponse.redirect(`${origin}/admin/dashboard`)
}
