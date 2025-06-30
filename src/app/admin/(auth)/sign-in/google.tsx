'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { FaGoogle } from 'react-icons/fa'

export function SignInWithGoogle() {
  const host = window.location.host

  async function signInWithGoogle() {
    const supabase = createClient()
    const redirectURL = `${host}/api/v1/admin/auth/callback`

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
