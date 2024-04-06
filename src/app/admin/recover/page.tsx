import { SignInForm } from './form'

export default function AdminSignIn() {
  return (
    <main className="flex flex-col items-center justify-center gap-6 p-8 h-screen">
      <h1 className="text-3xl">
        <strong className="text-5xl">ztore</strong>
        <span className="text-muted-foreground"> | Recuperar</span>
      </h1>

      <SignInForm />
    </main>
  )
}
