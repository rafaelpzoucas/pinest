import { Header } from '@/components/header'
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
      <Header title="Editar Perfil" />

      <ProfileForm user={user} />
    </section>
  )
}
