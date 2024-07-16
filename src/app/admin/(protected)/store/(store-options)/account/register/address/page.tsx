import { readAddressById } from '@/app/[public_store]/checkout/@summary/actions'
import { Header } from '@/components/header'
import { AddressForm } from './form'

export default async function AddressRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { address, addressError } = await readAddressById(searchParams.id)

  if (addressError) {
    console.error(addressError)
  }

  return (
    <section className="flex flex-col gap-4">
      <Header title="Editar Perfil" />

      <AddressForm address={address} />
    </section>
  )
}
