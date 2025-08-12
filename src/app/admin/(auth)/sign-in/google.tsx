'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { FaGoogle } from 'react-icons/fa'

export function SignInWithGoogle() {
  async function signInWithGoogle() {
    const supabase = createClient()

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const redirectURL = `${origin}/api/v1/admin/auth/callback?origin=${encodeURIComponent(origin)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectURL,
      },
    })

    if (error) {
      console.error(error)
    }
  }

  return (
    <Button
      variant={'outline'}
      className="w-full max-w-md"
      onClick={signInWithGoogle}
    >
      <FaGoogle className="mr-3" />
      Continuar com o Google
    </Button>
  )
}
