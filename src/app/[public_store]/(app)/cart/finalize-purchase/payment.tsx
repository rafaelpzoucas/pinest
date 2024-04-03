import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Banknote, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const paymentOptions = [
  {
    id: '1',
    title: 'Dinheiro',
    icon: <Banknote className="w-5 h-5 mr-2" />,
  },
  {
    id: '2',
    title: 'Cartão de crédito',
    icon: <CreditCard className="w-5 h-5 mr-2" />,
  },
  {
    id: '3',
    title: 'Cartão de débito',
    icon: <CreditCard className="w-5 h-5 mr-2" />,
  },
]

export function Payment() {
  const searchParams = useSearchParams()
  const selectedPickup = searchParams.get('pickup')
  const selectedAddress = searchParams.get('address')

  return (
    <section className="flex flex-col items-center gap-4 p-4">
      <header className="grid grid-cols-[1fr_5fr_1fr] items-center w-full py-2">
        <Link
          href={cn(
            selectedPickup === 'delivery'
              ? `?step=address&pickup=delivery&address=${selectedAddress}`
              : '?step=pickup',
          )}
          className="flex flex-row items-center p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-center text-lg font-bold w-full">
          Forma de pagamento
        </h1>
      </header>

      <div className="flex flex-col gap-2 w-full">
        {paymentOptions.map((option) => (
          <Link
            href={`?step=confirm&pickup=${selectedPickup}${selectedAddress ? `&address=${selectedAddress}` : ''}&payment=${option.id}`}
            key={option.title}
          >
            <Card className="flex flex-row items-center justify-between p-4 w-full">
              <p className="flex flex-row items-center">
                {option.icon}
                {option.title}
              </p>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
