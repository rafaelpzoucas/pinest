import { readAddressById } from '@/app/[public_store]/checkout/@summary/actions'
import { AdminHeader } from '@/components/admin-header'
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
      <AdminHeader title="Editar endereço" withBackButton />

      <AddressForm address={address} />
    </section>
  )
}
