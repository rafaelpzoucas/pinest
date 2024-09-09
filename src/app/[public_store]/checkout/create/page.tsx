import { buttonVariants } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createPurchase } from '../@summary/actions'
import { createStripeCheckout } from '../actions'

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
  }
}) {
  async function handleCreatePurchase() {
    const { purchase, purchaseError } = await createPurchase(
      parseInt(searchParams.totalAmount),
      searchParams.storeName,
      searchParams.addressId,
      parseFloat(searchParams.shippingPrice),
      parseFloat(searchParams.shippingTime),
      searchParams.pickup,
    )

    if (purchaseError) {
      console.error(purchaseError)
    }

    if (purchase) {
      await createStripeCheckout(searchParams.storeName, purchase.id)
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
