import { AdminHeader } from '@/app/admin-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { Printer } from 'lucide-react'
import { readPurchaseById } from './actions'
import { Tracking } from './tracking'
import { UpdateStatusButton } from './update-status-button'

type StatusKey = keyof typeof statuses

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) {
    return null
  }

  const displayId = params.id.substring(0, 4)

  const purchaseItems = purchase?.purchase_items
  const customer = purchase?.customers.users
  const address = purchase?.addresses

  const variations = purchase?.purchase_item_variations

  if (!purchase) {
    return null
  }

  return (
    <section className="flex flex-col gap-4 p-4 lg:px-0">
      <AdminHeader title={`Detalhes: #${displayId}`} withBackButton />

      <div className="flex flex-col lg:grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col items-start w-full gap-2 p-4">
            <Badge
              className={cn(statuses[purchase?.status as StatusKey].color)}
            >
              {statuses[purchase?.status as StatusKey].status}
            </Badge>

            <p>{statuses[purchase?.status as StatusKey].next_step}</p>

            <div className="flex flex-row items-center justify-between text-sm w-full">
              <strong>Total da venda</strong>
              <strong>{formatCurrencyBRL(purchase?.total_amount ?? 0)}</strong>
            </div>

            <div className="flex flex-row gap-2 items-end w-full">
              {purchase && (
                <UpdateStatusButton
                  currentStatus={purchase.status}
                  purchaseId={params.id}
                />
              )}

              <Button variant="outline" size="icon">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <header className="flex flex-row gap-4">
              <div className="flex flex-col gap-1">
                <strong>{customer?.name}</strong>

                {customer?.phone && (
                  <p className="text-xs text-muted-foreground">
                    Telefone: {customer?.phone}
                  </p>
                )}

                {address && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Endereço de entrega:
                    </span>
                    <p>{formatAddress(address)}</p>
                  </>
                )}
              </div>
            </header>

            <Tracking
              code={purchase.tracking_code}
              storeId={purchase.store_id}
            />
          </Card>
        </div>

        <section className="flex flex-col gap-2">
          <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

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

                  <div>
                    {variations &&
                      variations.map((variation) => (
                        <Badge key={variation.id} className="mr-2">
                          {variation.product_variations.name}
                        </Badge>
                      ))}
                  </div>
                </Card>
              ))}
          </div>
        </section>
      </div>
    </section>
  )
}
