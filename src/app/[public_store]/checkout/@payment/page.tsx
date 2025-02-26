'use client'

import { Card } from '@/components/ui/card'
import { ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const paymentOptions = [
  {
    id: 1,
    title: 'Cartão',
    provider: 'stripe',
    icon: CreditCard,
  },
  // {
  //   id: 2,
  //   title: 'PIX',
  //   provider: 'mercadopago',
  //   icon: CreditCard,
  // },
  // {
  //   id: 3,
  //   title: 'Dinheiro',
  //   provider: 'money',
  //   icon: Banknote,
  // },
]

export default function Payment() {
  const searchParams = useSearchParams()
  const selectedPickup = searchParams.get('pickup')
  const selectedAddress = searchParams.get('address')

  return (
    <section className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-2 w-full">
        {paymentOptions.map((option) => (
          <Link
            href={`?step=summary&pickup=${selectedPickup}${selectedAddress ? `&address=${selectedAddress}` : ''}&payment=${option.provider}`}
            key={option.title}
          >
            <Card className="flex flex-row items-center justify-between p-4 w-full">
              <p className="flex flex-row items-center">
                <option.icon className="w-5 h-5 mr-2" />
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
