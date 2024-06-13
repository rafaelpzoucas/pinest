import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function WelcomeStep() {
  return (
    <div className="flex flex-col h-full gap-4">
      <header>
        <h2>
          Bem vindo à <strong>Pinest</strong>,
        </h2>
        <h1 className="text-3xl font-bold">
          Vamos te ajudar a criar uma loja virtual incrível.
        </h1>
      </header>

      <p>
        Estamos quase lá! Precisamos só de algumas informações para deixar sua
        loja prontinha. Aqui estão os próximos passos para seguir:
      </p>

      <ol className="list-decimal text-sm space-y-2 px-4 text-muted-foreground">
        <li>
          <strong>Informações da Loja:</strong>
          <br />
          Nome, categoria e uma descrição da sua loja
        </li>
        <li>
          <strong>Cadastro de produtos:</strong>
          <br />
          Cadastre seus produtos para que eles apareçam na sua loja.
        </li>
        <li>
          <strong>Configuração de Pagamento:</strong>
          <br />
          Como você quer receber os pagamentos.
        </li>
        <li>
          <strong>Configuração de Envio:</strong>
          <br />
          Como vai enviar os produtos para os clientes.
        </li>
      </ol>

      <Link
        href="?step=profile&info=name"
        className={cn(buttonVariants(), 'mt-auto')}
      >
        Vamos começar <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  )
}
