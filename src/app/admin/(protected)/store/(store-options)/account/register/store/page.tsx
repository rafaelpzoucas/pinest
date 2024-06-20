import { Header } from '@/components/header'
import { StoreForm } from './form'

export default function StoreRegister() {
  return (
    <section className="flex flex-col gap-4">
      <Header title="Editar Loja" />

      <StoreForm />
    </section>
  )
}
