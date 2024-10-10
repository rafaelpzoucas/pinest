import { AdminHeader } from '@/components/admin-header'
import { BusinessHoursForm } from './form'

export default async function BusinessHoursRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Redes sociais" withBackButton />

      <BusinessHoursForm />
    </section>
  )
}
