'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { createPath } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { FaGoogle } from 'react-icons/fa'

export function SignInWithGoogle({
  subdomain,
  customDomain,
}: {
  subdomain?: string
  customDomain?: string
}) {
  const searchParams = useSearchParams()
  const isCheckout = searchParams.get('checkout')

  async function signInWithGoogle() {
    const supabase = createClient()

    const basePath =
      customDomain ||
      (subdomain
        ? `${subdomain}.pinest.com.br`
        : process.env.NEXT_PUBLIC_APP_URL)

    const redirectParams = customDomain
      ? `/api/v1/customer/auth/callback?subdomain=${subdomain}&custom_domain=${customDomain}${isCheckout ? '&checkout=true' : ''}`
      : `/api/v1/customer/auth/callback?subdomain=${subdomain}${isCheckout ? '&checkout=true' : ''}`

    const redirectURL = createPath(redirectParams, basePath)

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
