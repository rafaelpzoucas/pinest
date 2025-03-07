import { buttonVariants } from '@/components/ui/button'
import { UserCheck } from 'lucide-react'
import Link from 'next/link'
import { SignInWithGoogle } from './google'

export default function SignIn({
  params,
  searchParams,
}: {
  params: { public_store: string }
  searchParams: { checkout: string }
}) {
  const checkout = searchParams.checkout

  return (
    <main className="flex flex-col items-center gap-12 p-6 py-8">
      <header className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Olá, visitante</h1>
        <p className="text-muted-foreground">
          Para continuar sua compra, faça o login
        </p>
      </header>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        <SignInWithGoogle storeName={params.public_store} />

        <span className="mx-auto text-muted-foreground">ou</span>

        <Link
          href={`account${checkout ? '?checkout=pickup' : ''}`}
          className={buttonVariants({ variant: 'outline' })}
        >
          <UserCheck className="w-4 h-4 mr-2" /> Comprar sem conta
        </Link>
      </div>
    </main>
  )
}
