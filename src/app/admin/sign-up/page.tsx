'use client'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SignInForm } from './form'

export default function AdminSignIn() {
  const searchParams = useSearchParams()

  const confirm = searchParams.get('confirm')

  return (
    <main className="flex flex-col items-center justify-center gap-6 p-8 h-screen">
      <h1 className="text-3xl">
        <strong className="text-5xl">ztore</strong>
        <span className="text-muted-foreground"> | Cadastro</span>
      </h1>

      {confirm === 'success' ? (
        <Card className="flex flex-col gap-8 p-6">
          E-mail confirmado com sucesso
          <Link href="/admin/sign-in" className={cn(buttonVariants())}>
            Acessar conta
          </Link>
        </Card>
      ) : (
        <SignInForm />
      )}
    </main>
  )
}
