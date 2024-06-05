'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { FaGoogle } from 'react-icons/fa'

export function SignInWithGoogle() {
  async function signInWithGoogle() {
    const supabase = createClient()
    const redirectURL = `${process.env.NEXT_PUBLIC_APP_URL}/admin/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectURL,
      },
    })

    if (error) {
      console.log(error)
    }
  }

  return (
    <Button variant={'outline'} className="w-full" onClick={signInWithGoogle}>
      <FaGoogle className="mr-3" />
      Continuar com o Google
    </Button>
  )
}
