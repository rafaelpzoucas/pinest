'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { stringToNumber } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { PurchaseType } from '@/models/purchase'
import { ShippingConfigType } from '@/models/shipping'
import { StoreCustomerType } from '@/models/store-customer'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useServerAction } from 'zsa-react'
import { createPurchase, updatePurchase } from './actions'
import { ProductsList } from './products/list'
import { createPurchaseFormSchema } from './schemas'
import { Summary } from './summary'

export function CreatePurchaseForm({
  customers,
  products,
  categories,
  extras,
  shipping,
  purchase,
}: {
  customers?: StoreCustomerType[]
  products?: ProductType[]
  categories?: CategoryType[]
  extras?: ExtraType[]
  shipping?: ShippingConfigType
  purchase?: PurchaseType
}) {
  const router = useRouter()

  // 1. Define your form.
  const form = useForm<z.infer<typeof createPurchaseFormSchema>>({
    resolver: zodResolver(createPurchaseFormSchema),
    defaultValues: {
      customer_id: purchase?.customer_id ?? '',
      purchase_items: purchase?.purchase_items ?? [],
      status: 'preparing',
      type: purchase?.type ?? undefined,
      payment_type: purchase?.payment_type ?? undefined,
      observations: purchase?.observations ?? undefined,
      delivery: purchase?.delivery ?? undefined,
      total: {
        subtotal: purchase?.total?.subtotal ?? 0,
        change_value: purchase?.total?.change_value?.toString() ?? '',
        discount: purchase?.total?.discount?.toString() ?? '',
        total_amount: purchase?.total?.total_amount ?? 0,
        shipping_price: shipping?.price ?? 0,
      },
    },
  })

  const selectedProducts = form.watch('purchase_items') ?? []

  const purchaseType = form.watch('type')
  const discountValue = form.watch('total.discount') ?? 'R$ 0,00'
  const discount = stringToNumber(discountValue)
  const shippingPrice = form.watch('total.shipping_price') ?? 0

  const subtotal = form.watch('total.subtotal') ?? 0

  const {
    execute: executeCreate,
    isPending: isCreating,
    data: createdPurchase,
  } = useServerAction(createPurchase, {
    onSuccess: () => {
      const purchase = createdPurchase?.createdPurchase[0]
      window.open(
        `/admin/purchases/deliveries/${purchase?.id}/receipt`,
        '_blank',
      )

      router.push('/admin/purchases?tab=deliveries')
    },
  })
  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updatePurchase,
    {
      onSuccess: () => {
        window.open(
          `/admin/purchases/deliveries/${purchase?.id}/receipt`,
          '_blank',
        )

        router.push('/admin/purchases?tab=deliveries')
      },
    },
  )

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof createPurchaseFormSchema>) {
    if (purchase) {
      await executeUpdate({ ...values, id: purchase.id })

      return
    }

    await executeCreate(values)
  }

  useEffect(() => {
    const subscription = form.watch((values) => {
      const purchaseItems = values.purchase_items ?? []

      const subtotal = purchaseItems
        .filter((item) => item?.product_id)
        .reduce((acc, item) => {
          const itemTotal = (item?.product_price ?? 0) * (item?.quantity ?? 1)
          const extrasTotal = (item?.extras ?? []).reduce(
            (extraAcc, extra) =>
              extraAcc + (extra?.price ?? 0) * (extra?.quantity ?? 1),
            0,
          )

          return acc + itemTotal + extrasTotal
        }, 0)

      if (subtotal !== values.total?.subtotal) {
        form.setValue('total.subtotal', subtotal, { shouldValidate: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  console.log(form.formState.errors)
  console.log(form.watch('purchase_items'))

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] items-start gap-4 pb-16 lg:pb-0"
      >
        <Card className="flex lg:hidden flex-col gap-4 p-4 fixed bottom-2 left-2 right-2">
          <p>{selectedProducts.length} Produto(s) selecionado(s)</p>

          <Sheet>
            <SheetTrigger
              className={buttonVariants()}
              disabled={selectedProducts.length === 0}
            >
              Continuar
            </SheetTrigger>
            <SheetContent className="p-0">
              <ScrollArea className="h-dvh p-4">
                <SheetTitle>
                  <SheetClose>
                    <X />
                  </SheetClose>
                </SheetTitle>

                <Summary
                  isPending={isCreating || isUpdating}
                  form={form}
                  customers={customers}
                  extras={extras}
                  products={products}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </Card>

        <div className="hidden lg:block">
          <Summary
            isPending={isCreating || isUpdating}
            form={form}
            customers={customers}
            extras={extras}
            products={products}
          />
        </div>

        <aside className="lg:sticky top-4">
          <Card className="space-y-6 p-4 lg:h-[calc(100vh_-_1rem_-_5rem)]">
            <h1 className="text-lg font-bold">Produtos</h1>
            <ProductsList
              form={form}
              products={products}
              categories={categories}
            />
          </Card>
        </aside>
      </form>
    </Form>
  )
}
