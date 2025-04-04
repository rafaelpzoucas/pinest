'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
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

    // Determina se estamos usando um domínio personalizado ou o domínio padrão do Pinest
    const isPinestDomain = !customDomain

    let baseDomain
    if (isPinestDomain) {
      baseDomain =
        process.env.NODE_ENV !== 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : `https://${subdomain}.pinest.com.br`
    } else {
      baseDomain = customDomain
      if (!baseDomain.startsWith('http')) {
        baseDomain = `https://${baseDomain}`
      }
    }

    // Montamos os parâmetros da URL de callback
    const callbackParams = new URLSearchParams()
    if (subdomain) callbackParams.append('subdomain', subdomain)
    if (customDomain) callbackParams.append('custom_domain', customDomain)
    if (isCheckout) callbackParams.append('checkout', 'true')

    // URL de callback absoluta para o Supabase
    const callbackURL =
      process.env.NODE_ENV !== 'production'
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customer/auth/callback?${callbackParams.toString()}`
        : `https://www.pinest.com.br/api/v1/customer/auth/callback?${callbackParams.toString()}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackURL,
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
