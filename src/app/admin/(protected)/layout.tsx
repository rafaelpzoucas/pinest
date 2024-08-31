import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { readOwner } from './actions'
import { Navigation } from './navigation/index'

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

  const { owner, ownerError } = await readOwner()

  if (ownerError) {
    console.error(ownerError)
    return redirect('/admin/sign-in')
  }

  if (!owner) {
    return redirect('/admin/onboarding?step=1')
  }

  if (owner && owner?.role !== 'admin') {
    return redirect('/admin/sign-in')
  }

  return (
    <main className="md:flex flex-row">
      <Navigation />

      <ScrollArea className="w-full h-[calc(100vh_-_73px)] lg:px-5">
        <main className="flex flex-col items-center w-full">
          <div className="w-full max-w-7xl pb-16">{children}</div>
        </main>
      </ScrollArea>
    </main>
  )
}
