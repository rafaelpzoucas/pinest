import { Header } from '@/components/header'
import { AddressForm } from './form'

export default function AddressRegister() {
  return (
    <section className="flex flex-col gap-4">
      <Header title="Editar Perfil" />

      <AddressForm />
    </section>
  )
}
