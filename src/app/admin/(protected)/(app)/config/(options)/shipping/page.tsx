import { AdminHeader } from '@/components/admin-header'

import { readOwnShipping } from './actions'
import { selectCarriers } from './carrier/actions'
import { CarrierShippingForm } from './carrier/form'
import { OwnShippingForm } from './own-shipping/form'

export default async function ShippingPage() {
  const { shipping } = await readOwnShipping()
  const { carriers } = await selectCarriers()

  return (
    <div className="space-y-6">
      <AdminHeader title="Configurações de envio" />

      <CarrierShippingForm shipping={shipping} carriers={carriers} />

      <OwnShippingForm shipping={shipping} />
    </div>
  )
}
