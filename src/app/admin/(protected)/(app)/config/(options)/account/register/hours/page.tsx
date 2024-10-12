import { AdminHeader } from '@/components/admin-header'
import { readStoreByUserId, readStoreHours } from '../../actions'
import { BusinessHoursForm } from './form'

export default async function BusinessHoursRegister() {
  const { store } = await readStoreByUserId()

  if (!store) {
    return null
  }
  const { hours } = await readStoreHours(store?.store_url)

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Horário de atendimento" withBackButton />

      <BusinessHoursForm hours={hours} />
    </section>
  )
}
