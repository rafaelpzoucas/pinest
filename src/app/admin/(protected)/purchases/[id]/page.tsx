import { Header } from '@/components/header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrencyBRL } from '@/lib/utils'
import { ChevronRight, User } from 'lucide-react'
import Link from 'next/link'
import { readPurchaseById } from './actions'

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) {
    return null
  }

  const purchaseItems = purchase?.purchase_items
  const customer = purchase?.customers.users
  const address = purchase?.addresses

  return (
    <section className="flex flex-col gap-4 p-4">
      <Header />

      <Card className="flex flex-col gap-2 p-4">
        <div className="flex flex-row items-center justify-between text-sm">
          <strong>Total da venda</strong>
          <strong>{formatCurrencyBRL(purchase?.total_amount ?? 0)}</strong>
        </div>

        <Button className="mt-2">Despachar</Button>
      </Card>

      <Link href={`/customers/${customer?.id}`}>
        <Card className="p-4">
          <header className="flex flex-row gap-4">
            <Avatar>
              <AvatarFallback>{customer?.name[0] ?? <User />}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1">
              <strong>{customer?.name}</strong>
              {customer?.phone && (
                <p className="text-xs text-muted-foreground">
                  Telefone: {customer?.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Endereço: {address?.street}, {address?.number}
              </p>
            </div>

            <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
          </header>
        </Card>
      </Link>

      <section className="flex flex-col gap-2">
        <h1 className="text-lg font-bold">Itens do pedido</h1>

        <div className="flex flex-col gap-2">
          {purchaseItems &&
            purchaseItems.length > 0 &&
            purchaseItems.map((item) => (
              <Card key={item.id} className="p-4 space-y-2">
                <header className="flex flex-row items-start justify-between gap-4 text-sm">
                  <strong className="line-clamp-2">
                    x{item.quantity} {item?.products?.name}
                  </strong>
                  <span>{formatCurrencyBRL(item?.products?.price)}</span>
                </header>
              </Card>
            ))}
        </div>
      </section>
    </section>
  )
}
