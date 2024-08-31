import { Header } from '@/components/store-header'
import { AddressForm } from './form'

export default function CustomerAddressRegister() {
  return (
    <section className="p-4">
      <Header />

      <div>
        <AddressForm />
      </div>
    </section>
  )
}
