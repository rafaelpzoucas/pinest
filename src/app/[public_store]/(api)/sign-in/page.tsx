import { SignInWithGoogle } from './google'

export default function SignIn({
  params,
}: {
  params: { public_store: string }
}) {
  return (
    <main className="flex flex-col items-center gap-12 p-6 py-8">
      <header className="w-full">
        <h1 className="text-2xl font-bold">Olá, visitante</h1>
        <p className="text-muted-foreground">Para começar, faça o seu login</p>
      </header>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        <SignInWithGoogle storeName={params.public_store} />
      </div>
    </main>
  )
}
