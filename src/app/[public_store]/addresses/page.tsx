import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import { readAddresses } from './actions'

export default async function AddressesPage() {
  const { addresses, addressesError } = await readAddresses()

  return (
    <div className="p-4 space-y-4">
      <Header title="Meus endereços" />

      <div>
        {addresses &&
          addresses.map((address) => (
            <Card key={address.id} className="p-4">
              <p>
                {address.street}, {address.number}
              </p>
              <span className="text-sm text-muted-foreground">
                {address.city}/{address.state}
              </span>
            </Card>
          ))}
      </div>
    </div>
  )
}
