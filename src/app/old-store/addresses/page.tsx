import { Header } from '@/components/store-header'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { readAddress } from './actions'

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: { checkout: string; pickup: string }
}) {
  const { address } = await readAddress()

  return (
    <div className="space-y-4">
      <Header title="Meu endereço" />

      <div>
        {address && (
          <Link
            href={
              searchParams.checkout
                ? `${searchParams.checkout}&pickup=${searchParams.pickup}&address=${address.id}`
                : `addresses/register?id=${address.id}`
            }
          >
            <Card className="p-4">
              <p>
                {address.street}, {address.number}
              </p>
              <span className="text-sm text-muted-foreground">
                {address.city}/{address.state}
              </span>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
