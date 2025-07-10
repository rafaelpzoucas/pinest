import { AdminHeader } from '@/app/admin-header'
import { readStoreHoursCached } from '../../actions'
import { BusinessHoursForm } from './form'

export default async function BusinessHoursRegister() {
  const [hoursData] = await readStoreHoursCached()

  const hours = hoursData?.hours

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Horário de atendimento" withBackButton />

      <BusinessHoursForm hours={hours} />
    </section>
  )
}
