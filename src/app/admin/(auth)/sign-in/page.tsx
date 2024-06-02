import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { CheckCircle, MailWarning } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignInForm } from './form'

export default async function AdminSignIn({
  searchParams,
}: {
  searchParams: { message: string; error: string }
}) {
  const supabase = createClient()

  const { data: session, error } = await supabase.auth.getUser()

  if (!error || session?.user) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user?.id)

    if (user && user[0]?.role === 'admin') redirect('/admin/dashboard')
  }

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-8 h-screen">
      <h1 className="text-3xl">
        <strong className="text-5xl">ztore</strong>
      </h1>

      {searchParams.message && (
        <Card className={cn('flex flex-col gap-6 max-w-sm p-4')}>
          <p className="flex flex-row gap-2 text-lg">
            {searchParams.error ? <MailWarning /> : <CheckCircle />}

            {searchParams.error ? 'Erro ao autenticar' : 'Confira seu e-mail'}
          </p>
          <span className="text-sm text-muted-foreground">
            {searchParams.message}
          </span>

          {searchParams.error && (
            <Link href="/admin/sign-in" className={buttonVariants()}>
              Tentar novamente
            </Link>
          )}
        </Card>
      )}

      {!searchParams.message && <SignInForm />}
    </main>
  )
}
