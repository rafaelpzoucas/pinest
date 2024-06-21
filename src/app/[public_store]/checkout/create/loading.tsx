import { Loader2 } from 'lucide-react'

export default function CreatePurchaseLoading() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <Loader2 className="w-20 h-20 animate-spin text-primary" />
      <h1 className="text-2xl font-semibold text-primary">
        Obrigado por sua compra!
      </h1>

      <p className="text-lg text-muted-foreground">
        Estamos processando seu pedido...
      </p>

      <div className="flex flex-col items-center mt-4">
        <h2 className="text-lg font-medium">Precisa de ajuda?</h2>
        <p className="text-sm text-gray-600">
          Entre em contato com nosso suporte:
        </p>
        <a
          href="mailto:suporte@lojavirtual.com"
          className="text-blue-500 underline"
        >
          suporte@pinest.com.br
        </a>
      </div>
    </div>
  )
}
