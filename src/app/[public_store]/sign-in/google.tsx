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
    try {
      const supabase = createClient()

      const callbackParams = new URLSearchParams(searchParams)

      if (subdomain && !callbackParams.has('subdomain')) {
        callbackParams.set('subdomain', subdomain)
      }

      if (customDomain && !callbackParams.has('custom_domain')) {
        callbackParams.set('custom_domain', customDomain)
      }

      const redirectURL = `${
        window.location.origin
      }/api/v1/customer/auth/callback?${callbackParams.toString()}`

      console.log('Iniciando login Google:', {
        subdomain,
        customDomain,
        isCheckout,
        redirectURL,
        origin: window.location.origin,
      })

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
        },
      })

      if (error) {
        console.error('Erro no login Google:', error)
        alert('Erro ao fazer login com Google. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro inesperado no login Google:', error)
      alert('Erro inesperado. Tente novamente.')
    }
  }

  return (
    <Button variant={'outline'} className="w-full" onClick={signInWithGoogle}>
      <FaGoogle className="mr-3" />
      Continuar com o Google
    </Button>
  )
}
