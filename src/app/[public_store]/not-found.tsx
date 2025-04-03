import { Store } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-4 w-full h-screen max-w-xs
        text-muted-foreground text-center mx-auto"
    >
      <Store className="w-20 h-20" />
      <h1 className="text-2xl text-foreground">Loja não encontrada</h1>
      <p className="text-muted-foreground">
        Verifique se o link está correto e tente novamente.
      </p>
    </div>
  )
}
