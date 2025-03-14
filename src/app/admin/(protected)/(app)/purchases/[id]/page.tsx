import { AdminHeader } from '@/app/admin-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { statuses } from '@/models/statuses'
import { Plus, Printer as PrinterIcon } from 'lucide-react'
import Link from 'next/link'
import { readPurchaseById } from './actions'
import { UpdateStatusButton } from './update-status-button'

type StatusKey = keyof typeof statuses

export default async function OrderPage({
  params,
}: {
  params: { id: string; print: string }
}) {
  const { purchase, purchaseError } = await readPurchaseById(params.id)

  if (purchaseError) {
    return null
  }

  const displayId = params.id.substring(0, 4)

  const purchaseItems = purchase?.purchase_items
  const customer = purchase?.customers?.users ?? purchase?.guest_data
  const address = purchase?.addresses ?? purchase?.guest_data?.address

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

              <Link
                href={`${purchase.id}/receipt`}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'min-w-9',
                )}
              >
                <PrinterIcon className="w-4 h-4" />
              </Link>
            </div>
          </Card>

          <Card className="p-4">
            <header className="flex flex-row gap-4">
              <div className="flex flex-col gap-1">
                <strong>{customer?.name ?? purchase.customers.name}</strong>

                {customer?.phone && (
                  <p className="text-xs text-muted-foreground">
                    Telefone: {customer?.phone ?? purchase.customers.phone}
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

                {purchase.customers?.address && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Endereço de entrega:
                    </span>
                    <p>{purchase.customers?.address}</p>
                  </>
                )}
              </div>
            </header>

            {/* <Tracking
              code={purchase.tracking_code}
              storeId={purchase.store_id}
            /> */}
          </Card>
        </div>

        <section className="flex flex-col gap-2">
          <h1 className="text-lg font-bold mb-2">Itens da venda</h1>

          <div className="flex flex-col gap-2">
            {purchaseItems &&
              purchaseItems.length > 0 &&
              purchaseItems.map((item) => {
                // Calculando o total do item (produto base)
                const itemTotal = item.product_price

                // Calculando o total dos extras
                const extrasTotal = item.extras.reduce((acc, extra) => {
                  return acc + extra.price * extra.quantity
                }, 0)

                // Somando o total do item com o total dos extras
                const total = (itemTotal + extrasTotal) * item.quantity

                return (
                  <Card key={item.id} className="p-4 space-y-2">
                    <header className="flex flex-row items-start justify-between gap-4 text-sm">
                      <strong className="line-clamp-2 uppercase">
                        {item.quantity} {item?.products?.name}
                      </strong>
                      <span>{formatCurrencyBRL(item?.products?.price)}</span>
                    </header>

                    {item.extras.length > 0 &&
                      item.extras.map((extra) => (
                        <p className="flex flex-row items-center justify-between w-full text-muted-foreground">
                          <span className="flex flex-row items-center">
                            <Plus className="w-3 h-3 mr-1" /> {extra.quantity}{' '}
                            ad. {extra.name}
                          </span>
                          <span>
                            {formatCurrencyBRL(extra.price * extra.quantity)}
                          </span>
                        </p>
                      ))}

                    {item.observations && (
                      <strong className="uppercase text-muted-foreground">
                        obs: {item.observations}
                      </strong>
                    )}

                    <div>
                      {variations &&
                        variations.map((variation) => (
                          <Badge key={variation.id} className="mr-2">
                            {variation.product_variations.name}
                          </Badge>
                        ))}
                    </div>

                    <footer className="flex flex-row items-center justify-between">
                      <p>Total:</p>
                      <span>{formatCurrencyBRL(total)}</span>{' '}
                      {/* Exibindo o total calculado */}
                    </footer>
                  </Card>
                )
              })}
          </div>
        </section>
      </div>
    </section>
  )
}
