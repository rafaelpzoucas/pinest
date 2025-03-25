'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { useServerAction } from 'zsa-react'
import { createPurchaseFormSchema } from '../schemas'
import { readCustomerLastPurchases } from './actions'

export function LastPurchases({
  customerId,
  form,
}: {
  customerId: string
  form: UseFormReturn<z.infer<typeof createPurchaseFormSchema>>
}) {
  const [lastPurchases, setLastPurchases] = useState<PurchaseType[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const { execute, isPending, data } = useServerAction(
    readCustomerLastPurchases,
    {
      onSuccess: () => {
        if (data?.lastPurchases) {
          setLastPurchases(data?.lastPurchases)
        }
      },
    },
  )

  function handleSelect(purchase: PurchaseType) {
    setIsOpen(false)

    const formattedItems = purchase.purchase_items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      product_price: item.product_price,
      observations: item.observations || '',
      extras:
        item.extras?.map((extra) => ({
          name: extra.name,
          price: extra.price,
          extra_id: extra.id,
          quantity: extra.quantity,
        })) || [],
    }))

    form.setValue('purchase_items', formattedItems)
  }

  async function handleGetCustomerLastPurchases() {
    execute({ customerId })
  }

  useEffect(() => {
    handleGetCustomerLastPurchases()
  }, [customerId])

  console.log({ lastPurchases })

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
        Ver últimos pedidos
      </SheetTrigger>
      <SheetContent>
        <ScrollArea className="h-dvh">
          <SheetHeader>
            <SheetTitle>Últimos pedidos</SheetTitle>
          </SheetHeader>

          {isPending ? (
            <p>Carregando...</p>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {lastPurchases.map((purchase) => (
                <Card key={purchase.id} className="p-4">
                  <header className="flex flex-row justify-between w-full">
                    <span className="text-muted-foreground">
                      {format(purchase.created_at, 'dd/MM HH:mm')}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => handleSelect(purchase)}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Selecionar
                    </Button>
                  </header>

                  {purchase.purchase_items
                    .filter((item) => item?.products)
                    .map((item) => (
                      <div>
                        <p>
                          {item.quantity} un. {item?.products?.name}
                        </p>
                        {item.extras.map((extra) => (
                          <p>
                            + {extra.quantity} ad. {extra.name}
                          </p>
                        ))}
                      </div>
                    ))}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
