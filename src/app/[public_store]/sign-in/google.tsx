'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { FaGoogle } from 'react-icons/fa'

export function SignInWithGoogle({ storeName }: { storeName: string }) {
  const searchParams = useSearchParams()
  const isCheckout = searchParams.get('checkout')

  async function signInWithGoogle() {
    const supabase = createClient()
    const redirectURL = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customer/auth/callback?store-name=${storeName}${isCheckout ? '&checkout=true' : ''}`

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
    <Button variant={'outline'} className="w-full" onClick={signInWithGoogle}>
      <FaGoogle className="mr-3" />
      Continuar com o Google
    </Button>
  )
}
