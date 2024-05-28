import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function PickupOptions() {
  const searchParams = useSearchParams()
  const selectedPickup = searchParams.get('pickup')
  const selectedAddress = searchParams.get('address')
  const selectedPayment = searchParams.get('payment')

  const defaultAddress = '1'

  return (
    <section className="flex flex-col items-center gap-4 p-4">
      <header className="w-full py-2">
        <h1 className="text-center text-lg font-bold w-full">
          Forma de entrega
        </h1>
      </header>

      <div className="flex flex-col gap-2 w-full">
        <Card className="flex flex-col gap-2 p-4 w-full">
          <Link
            href={`?step=payment&pickup=delivery&address=${defaultAddress}`}
            className="space-y-2"
          >
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Entregar no meu endereço</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>R$ 6000,00</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-2">
              Rua Castro Alves, 03 - Centro - Assis/SP
            </p>
          </Link>

          <Link
            href={`?step=address&pickup=delivery${selectedAddress ? '&address=' + selectedAddress : ''}${selectedPayment ? '&payment=' + selectedPayment : ''}`}
          >
            <footer className="border-t pt-4 pb-1 mt-2 text-sm">
              <strong>Editar ou escolher outro endereço</strong>
            </footer>
          </Link>
        </Card>

        <Card className="flex flex-col gap-2 p-4 w-full">
          <Link
            href={`?step=${selectedPayment ? 'confirm' : 'payment'}&pickup=takeout${selectedAddress ? '&address=' + selectedAddress : ''}${selectedPayment ? '&payment=' + selectedPayment : ''}`}
            className="space-y-2"
          >
            <header className="flex flex-row items-center justify-between">
              <strong className="text-sm">Retirar na loja</strong>

              <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">
                <p>Grátis</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </header>

            <p className="text-muted-foreground line-clamp-2">
              Av Rui Barbosa, 3000 - Centro - Assis/SP
            </p>
          </Link>

          <Link href="">
            <footer className="border-t pt-4 pb-1 mt-2 text-sm">
              <strong>Ver localização</strong>
            </footer>
          </Link>
        </Card>
      </div>
    </section>
  )
}
