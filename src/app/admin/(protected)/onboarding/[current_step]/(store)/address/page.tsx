import { AddressForm } from '@/app/admin/(protected)/(app)/config/(options)/account/register/address/form'

export default function AddressStep() {
  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Redes sociais</h1>

      <AddressForm address={null} />
    </div>
  )
}
