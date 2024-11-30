import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const supabase = createClient()

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError) {
    console.error(sessionError)

    return NextResponse.redirect(`${origin}/admin/sign-in`)
  }

  const { error: updateSubscriptionStatusError } = await supabase
    .from('users')
    .update({ subscription_status: 'active' })
    .eq('id', session.user.id)

  if (updateSubscriptionStatusError) {
    console.error(updateSubscriptionStatusError)

    return NextResponse.redirect(`${origin}/admin/sign-in`)
  }

  return NextResponse.redirect(`${origin}/admin/sign-in`)
}
