import { AdminHeader } from '@/app/admin-header'
import { readStoreHours } from '../../actions'
import { BusinessHoursForm } from './form'

export default async function BusinessHoursRegister() {
  const [hoursData] = await readStoreHours()

  const hours = hoursData?.hours

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Horário de atendimento" withBackButton />

      <BusinessHoursForm hours={hours} />
    </section>
  )
}
