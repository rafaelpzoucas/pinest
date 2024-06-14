import { Island } from '@/components/island'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Navigation } from './navigation'

export const metadata: Metadata = {
  title: 'Pinest | Admin',
  description:
    'Crie sua loja virtual em minutos e alcance o sucesso no e-commerce!',
}

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    redirect('/admin/sign-in')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    return redirect('/admin/onboarding')
  }

  if (data && data?.role !== 'admin') {
    return redirect('/admin/sign-in')
  }

  return (
    <main className="pb-16 md:flex flex-row">
      <Island>
        <Navigation />
      </Island>

      {children}
    </main>
  )
}
