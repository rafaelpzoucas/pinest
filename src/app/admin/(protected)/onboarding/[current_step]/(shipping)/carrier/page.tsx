import { readOwnShipping } from '@/app/admin/(protected)/(app)/config/(options)/shipping/actions'
import { selectCarriers } from '@/app/admin/(protected)/(app)/config/(options)/shipping/carrier/actions'
import { CarrierShippingForm } from '@/app/admin/(protected)/(app)/config/(options)/shipping/carrier/form'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function Shipping() {
  const { shipping } = await readOwnShipping()
  const { carriers } = await selectCarriers()

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Configurar envio</h1>

      <CarrierShippingForm shipping={shipping} carriers={carriers} />

      <div className="flex flex-row gap-2 w-fit ml-auto">
        <Link
          href="own"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-fit ml-auto',
          )}
        >
          Voltar
        </Link>
        <Link
          href="/admin/dashboard"
          className={cn(buttonVariants(), 'w-fit ml-auto')}
        >
          Finalizar
        </Link>
      </div>
    </div>
  )
}
