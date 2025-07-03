'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { CategoryType } from '@/models/category'
import { ExtraType } from '@/models/extras'
import { ProductType } from '@/models/product'
import { PurchaseType } from '@/models/purchase'
import { ShippingConfigType } from '@/models/shipping'
import { StoreCustomerType } from '@/models/store-customer'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useServerAction } from 'zsa-react'
import { createPurchase, updatePurchase } from './actions'
import { CustomersCombobox } from './customers/combobox'
import { ProductsList } from './products/list'
import { SelectedProducts } from './products/selected-products'
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
  const customerFormSheetState = useState(false)
  const [isFinishOpen, setIsFinishOpen] = useState(false)

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
      delivery: {
        time: purchase?.delivery?.time?.toString() ?? undefined,
        address: purchase?.delivery?.address ?? undefined,
      },
      total: {
        subtotal: purchase?.total?.subtotal ?? 0,
        change_value: purchase?.total?.change_value?.toString() ?? undefined,
        discount: purchase?.total?.discount?.toString() ?? undefined,
        total_amount: purchase?.total?.total_amount ?? 0,
        shipping_price: shipping?.price ?? 0,
      },
    },
  })

  const { execute: executeCreate, isPending: isCreating } = useServerAction(
    createPurchase,
    {
      onSuccess: () => {
        router.push('/admin/purchases?tab=deliveries')
        setIsFinishOpen(false)
      },
    },
  )
  const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
    updatePurchase,
    {
      onSuccess: () => {
        router.push('/admin/purchases?tab=deliveries')
        setIsFinishOpen(false)
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
        const deliveryFee = form.watch('total.shipping_price')
        const discount = form.watch('total.discount')

        form.setValue('total.subtotal', subtotal, { shouldValidate: true })
        form.setValue(
          'total.total_amount',
          subtotal + deliveryFee - (discount ? parseFloat(discount) : 0),
        )
      }
    })

    return () => subscription.unsubscribe()
  }, [form.watch])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex flex-col items-start gap-4 h-[calc(100vh_-_2rem)] lg:pb-0"
      >
        <CustomersCombobox
          storeCustomers={customers}
          form={form}
          customerFormSheetState={customerFormSheetState}
        />

        <Sheet>
          <SheetTrigger className={cn(buttonVariants(), 'w-fit')}>
            <Plus className="w-4 h-4" />
            Adicionar produtos
          </SheetTrigger>
          <SheetContent className="!max-w-2xl space-y-2">
            <SheetHeader className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">Produtos</SheetTitle>
            </SheetHeader>

            <ProductsList
              form={form}
              categories={categories}
              products={products}
            />
          </SheetContent>
        </Sheet>

        <ScrollArea className="w-full h-[calc(100vh_-_32px_-_77px_-_32px)]">
          <Card className="flex flex-col h-full">
            <CardContent className="p-4">
              <SelectedProducts
                form={form}
                extras={extras}
                products={products}
              />
            </CardContent>
          </Card>
        </ScrollArea>

        <div className="hidden lg:block w-full">
          <Summary
            isPending={isCreating || isUpdating}
            form={form}
            onSubmit={onSubmit}
          />
        </div>

        <Sheet open={isFinishOpen} onOpenChange={setIsFinishOpen}>
          <SheetTrigger className={cn(buttonVariants(), 'lg:hidden w-full')}>
            Finalizar pedido
          </SheetTrigger>
          <SheetContent className="space-y-2">
            <SheetHeader className="flex flex-row items-center gap-2">
              <SheetClose
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
              >
                <ArrowLeft />
              </SheetClose>
              <SheetTitle className="!mt-0">Finalizar pedido</SheetTitle>
            </SheetHeader>

            <Summary
              isPending={isCreating || isUpdating}
              form={form}
              onSubmit={onSubmit}
            />
          </SheetContent>
        </Sheet>
      </form>
    </Form>
  )
}
