import { buttonVariants } from '@/components/ui/button'
import { CreatePurchaseType } from '@/models/purchase'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createPurchase } from '../@summary/actions'
import { handlePayment } from '../actions'

export default async function CreatePurchase({
  searchParams,
}: {
  searchParams: {
    totalAmount: string
    storeName: string
    addressId: string
    shippingPrice: string
    shippingTime: string
    pickup: string
    payment: string
    change: string
    changeValue: string
  }
}) {
  async function handleCreatePurchase() {
    const newPurchase: CreatePurchaseType = {
      addressId:
        searchParams.addressId === 'guest' ? null : searchParams.addressId,
      type: searchParams.pickup,
      payment_type: searchParams.payment,
      storeName: searchParams.storeName,
      totalAmount: parseInt(searchParams.totalAmount),
      shippingPrice: parseFloat(searchParams.shippingPrice),
      shippingTime: parseFloat(searchParams.shippingTime),
      changeValue: parseFloat(searchParams.changeValue),
    }

    const { purchase, purchaseError } = await createPurchase(newPurchase)

    if (purchaseError) {
      console.error(purchaseError)
    }

    if (purchase) {
      await handlePayment(purchase.id, searchParams.storeName)
    }
  }

  await handleCreatePurchase()

  return (
    <div className="flex flex-col items-center justify-center text-center gap-2">
      <CheckCircle2 className="w-20 h-20 text-primary" />

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
        <Link
          href="mailto:suporte@lojavirtual.com"
          className={buttonVariants({ variant: 'link' })}
        >
          suporte@pinest.com.br
        </Link>
      </div>
    </div>
  )
}
