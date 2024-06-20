import { Header } from '@/components/header'
import { ProfileForm } from './form'

export default function ProfileRegister() {
  return (
    <section className="flex flex-col gap-4">
      <Header title="Editar Perfil" />

      <ProfileForm />
    </section>
  )
}
