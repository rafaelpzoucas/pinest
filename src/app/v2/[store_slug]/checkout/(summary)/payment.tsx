'use client'

import { CopyTextButton } from '@/components/copy-text-button'
import { buttonVariants } from '@/components/ui/button'
import { useReadStore } from '@/features/store/store/hooks'
import { createPath, formatCurrencyBRL, stringToNumber } from '@/lib/utils'
import { cn } from '@/utils/cn'
import { Banknote, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { FaPix } from 'react-icons/fa6'

export function Payment() {
  const params = useParams()
  const searchParams = useSearchParams()

  const storeSlug = params.store_slug as string

  const pickup = searchParams.get('pickup') as 'DELIVERY' | 'TAKEOUT'
  const payment = searchParams.get('payment')
  const changeValue = searchParams.get('changeValue')
  const { data: storeData } = useReadStore({ storeSlug })
  const store = storeData?.store

  const PAYMENT_METHODS = {
    CREDIT: {
      label: 'com cartão de crédito',
      description: 'O pagamento será feito no momento da entrega ou retirada.',
    },
    DEBIT: {
      label: 'com cartão de débito',
      description: 'O pagamento será feito no momento da entrega ou retirada.',
    },
    CASH: {
      label: `em dinheiro${
        changeValue
          ? ' - troco para ' + formatCurrencyBRL(stringToNumber(changeValue))
          : ''
      }`,
      description: changeValue
        ? `Prepare ${formatCurrencyBRL(
            stringToNumber(changeValue),
          )}, teremos troco disponível na ${pickup === 'DELIVERY' ? 'entrega.' : 'retirada.'}`
        : `Tenha o valor em mãos no momento da ${
            pickup === 'DELIVERY' ? 'entrega.' : 'retirada.'
          }`,
    },
    PIX: {
      label: 'com PIX',
      description: store?.pix_key
        ? 'Use a chave abaixo no seu app bancário para concluir o pagamento.'
        : 'Esta loja ainda não informou uma chave PIX. Confirme no balcão ou com o entregador.',
    },
  } as const

  const paymentKey = payment as keyof typeof PAYMENT_METHODS
  return (
    <section className="flex flex-col items-center gap-2 text-center border-b p-6">
      {payment === 'CREDIT' && <CreditCard />}
      {payment === 'DEBIT' && <CreditCard />}
      {payment === 'CASH' && <Banknote />}
      {payment === 'PIX' && <FaPix className="w-5 h-5" />}
      <p className="text-lg">
        Você pagará {PAYMENT_METHODS[paymentKey]?.label}
      </p>
      {paymentKey === 'PIX' && store?.pix_key ? (
        <div>
          <CopyTextButton textToCopy={store?.pix_key} buttonText="Chave PIX" />
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">
          {PAYMENT_METHODS[paymentKey]?.description}
        </span>
      )}

      <Link
        href={createPath(`/checkout?step=payment&pickup=${pickup}`, storeSlug)}
        className={cn(buttonVariants({ variant: 'link' }))}
      >
        Alterar meio de pagamento
      </Link>
    </section>
  )
}
