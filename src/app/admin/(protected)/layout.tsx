import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { readOwner } from './(app)/actions'

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

  const { data: session, error: sessionError } = await supabase.auth.getUser()

  if (sessionError || !session?.user) {
    redirect('/admin/sign-in')
  }

  const { owner } = await readOwner()

  if (owner && owner?.role !== 'admin') {
    return redirect('/admin/sign-in')
  }

  return <>{children}</>
}
