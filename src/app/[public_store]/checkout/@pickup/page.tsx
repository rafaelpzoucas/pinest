import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { readCustomerAddress, readStoreAddress } from '../actions'

export default async function PickupOptions({
  params,
}: {
  params: { public_store: string }
}) {
  const { storeAddresses, storeAddressError } = await readStoreAddress(
    params.public_store,
  )
  const { customerAddress, customerAddressError } = await readCustomerAddress()

  if (customerAddressError) {
    console.error(customerAddressError)
  }

  if (storeAddressError) {
    console.error(storeAddressError)
  }

  const storeAddress = storeAddresses?.addresses[0]

  return (
    <div className="flex flex-col gap-2 w-full">
      <Card className="flex flex-col gap-2 p-4 w-full">
        {!customerAddress ? (
          <Link href="addresses/register">
            <div>
              <header className="flex flex-row items-center justify-between">
                <strong className="text-sm">Entregar no meu endereço</strong>

                <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </header>
              <p className="text-muted-foreground mt-2">
                Cadastre o seu endereço
              </p>
            </div>
          </Link>
        ) : (
          <>
            <Link
              href={`?step=summary&pickup=delivery&address=${customerAddress?.id}`}
              className="space-y-2"
            >
              <header className="flex flex-row items-center justify-between">
                <strong className="text-sm">Entregar no meu endereço</strong>

                <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                  <p>R$ 0,00</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </header>

              <p className="text-muted-foreground line-clamp-2">
                {customerAddress?.street}, {customerAddress?.number} -{' '}
                {customerAddress?.neighborhood} - {customerAddress?.city}/
                {customerAddress?.state}
              </p>
            </Link>

            {/* <Link href={``}>
              <footer className="border-t pt-4 pb-1 mt-2 text-sm">
                <strong>Editar ou escolher outro endereço</strong>
              </footer>
            </Link> */}
          </>
        )}
      </Card>

      {storeAddress && (
        <Card className="flex flex-col gap-2 p-4 w-full">
          <Link href={``} className="space-y-2">
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Retirar na loja</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>Grátis</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-2">
              {storeAddress?.street}, {storeAddress?.number} -{' '}
              {storeAddress?.neighborhood} - {storeAddress?.city}/
              {storeAddress?.state}
            </p>
          </Link>

          <Link href="">
            <footer className="border-t pt-4 pb-1 mt-2 text-sm">
              <strong>Ver localização</strong>
            </footer>
          </Link>
        </Card>
      )}
    </div>
  )
}
