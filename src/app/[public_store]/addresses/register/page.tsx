import { Header } from '@/components/store-header'
import { readAddressById } from '../../checkout/@summary/actions'
import { AddressForm } from './form'

export default async function CustomerAddressRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { address } = await readAddressById(searchParams.id)

  return (
    <section className="space-y-6">
      <Header />

      <AddressForm address={address} />
    </section>
  )
}
