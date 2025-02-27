import { AdminHeader } from '@/app/admin-header'
import { readUserById } from './actions'
import { ProfileForm } from './form'

export default async function ProfileRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { user, userError } = await readUserById(searchParams.id)

  if (userError) {
    console.error(userError)
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Editar perfil" withBackButton />

      <ProfileForm user={user} />
    </section>
  )
}
