import { Card } from '@/components/ui/card'
import { formatAddress, formatCurrencyBRL } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { readOwnShipping } from '../../(app)/header/actions'
import { readCustomerAddress, readStoreAddress } from '../actions'

export default async function PickupOptions({
  params,
}: {
  params: { public_store: string }
}) {
  const { storeAddress, storeAddressError } = await readStoreAddress(
    params.public_store,
  )
  const { customerAddress, customerAddressError } = await readCustomerAddress()
  const { shipping } = await readOwnShipping(params.public_store)

  if (customerAddressError) {
    console.error(customerAddressError)
  }

  if (storeAddressError) {
    console.error(storeAddressError)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      {shipping && shipping.status && (
        <Card className="flex flex-col gap-2 w-full">
          {!customerAddress ? (
            <Link href="addresses/register">
              <div className="flex flex-col gap-2 p-4 w-full hover:bg-secondary/30">
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
                <div className="flex flex-col gap-2 p-4 w-full max-w-md hover:bg-secondary/30">
                  <header className="flex flex-row items-center justify-between">
                    <strong className="text-sm">
                      Entregar no meu endereço
                    </strong>

                    <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                      <p>{formatCurrencyBRL(shipping?.price)}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </header>

                  <p className="text-muted-foreground line-clamp-2">
                    {formatAddress(customerAddress)}
                  </p>
                </div>
              </Link>

              <Link
                href={`addresses?checkout=/${params.public_store}/checkout?step=summary&pickup=delivery`}
              >
                <footer className="border-t p-4 text-sm">
                  <strong>Editar endereço</strong>
                </footer>
              </Link>
            </>
          )}
        </Card>
      )}

      {storeAddress && (
        <Card className="flex flex-col gap-2 w-full">
          <Link href={`?step=summary&pickup=pickup`} className="space-y-2 p-4">
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Retirar na loja</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>Grátis</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-2">
              {formatAddress(storeAddress)}
            </p>
          </Link>

          <Link
            href={`https://www.google.com/maps?q=${formatAddress(storeAddress).replaceAll(' ', '+')}`}
            target="_blank"
          >
            <footer className="border-t p-4 text-sm">
              <strong>Ver localização</strong>
            </footer>
          </Link>
        </Card>
      )}
    </div>
  )
}
