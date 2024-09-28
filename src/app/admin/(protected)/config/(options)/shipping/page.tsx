import { AdminHeader } from '@/components/admin-header'

import { readOwnShipping } from './own-shipping/actions'
import { OwnShippingForm } from './own-shipping/form'

export default async function ShippingPage() {
  const { shipping } = await readOwnShipping()

  return (
    <div className="space-y-6">
      <AdminHeader title="Configurações de envio" />

      <OwnShippingForm shipping={shipping} />
    </div>
  )
}
