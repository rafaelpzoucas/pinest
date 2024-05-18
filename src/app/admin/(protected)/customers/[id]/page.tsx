import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, MoreVertical, Pencil } from 'lucide-react'
import Link from 'next/link'

export default function CustomerPage() {
  return (
    <main className="space-y-6 p-4">
      <header className="flex flex-row items-center gap-4">
        <Link href={'/customers'}>
          <Button variant={'ghost'} size={'icon'}>
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-lg text-center font-bold">Detalhes do cliente</h1>
      </header>

      <section className="flex flex-col gap-6">
        <Card className="p-4">
          <header className="flex flex-row gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <strong>{'order.customer_name'}</strong>
              <p className="text-xs text-muted-foreground">
                Telefone: +5518998261736
              </p>
              <p className="text-xs text-muted-foreground">
                Endereço: Rua Santa Cruz, 801
              </p>
            </div>

            <Pencil className="w-4 h-4 ml-auto text-muted-foreground" />
          </header>
        </Card>

        <Card className="flex items-center justify-center p-4">
          <strong>10 pedidos na loja</strong>
        </Card>

        <Card className="flex flex-row items-center justify-between p-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Endereço</span>
            <strong>Rua Castro Alves, 3</strong>
          </div>
          <Button variant={'ghost'} size={'icon'} className="w-8 h-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </Card>
      </section>
    </main>
  )
}
