import { AdminHeader } from '@/components/admin-header'
import { SocialsForm } from './form'

export default async function ProfileRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Redes sociais" withBackButton />

      <SocialsForm />
    </section>
  )
}
