'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createServerAction } from 'zsa'
import { authCallbackInputSchema } from './schemas'

export const exchangeCodeForSession = createServerAction()
  .input(authCallbackInputSchema)
  .handler(async ({ input }) => {
    const supabase = createClient()
    const { origin, code } = input

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Exchange code error:', error)
        return redirect(`/admin/sign-in?error=exchange_failed`)
      }
    }

    return { origin }
  })
