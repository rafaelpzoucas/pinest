import { readOwnShipping } from '@/app/admin/(protected)/(app)/config/(options)/shipping/actions'
import { OwnShippingForm } from '@/app/admin/(protected)/(app)/config/(options)/shipping/own-shipping/form'

export default async function Shipping() {
  const { shipping } = await readOwnShipping()

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Configurar envio</h1>

      <OwnShippingForm shipping={shipping} />
    </div>
  )
}
