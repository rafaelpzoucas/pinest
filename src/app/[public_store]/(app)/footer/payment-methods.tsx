import amex from '@/../public/payments/amex.webp'
import boleto from '@/../public/payments/boleto.webp'
import diners from '@/../public/payments/diners.webp'
import elo from '@/../public/payments/elo.webp'
import hiper from '@/../public/payments/hiper.webp'
import mastercard from '@/../public/payments/mastercard.webp'
import visa from '@/../public/payments/visa.webp'
import Image from 'next/image'

const PAYMENT_METHODS = [
  {
    label: 'Visa',
    icon: visa,
    paymentMethodId: 'visa',
  },
  {
    label: 'MasterCard',
    icon: mastercard,
    paymentMethodId: 'mastercard',
  },
  {
    label: 'American Express',
    icon: amex,
    paymentMethodId: 'amex',
  },
  {
    label: 'Elo',
    icon: elo,
    paymentMethodId: 'elo',
  },
  {
    label: 'Diners Club',
    icon: diners,
    paymentMethodId: 'diners',
  },
  {
    label: 'Hipercard',
    icon: hiper,
    paymentMethodId: 'hiper',
  },
  {
    label: 'Boleto',
    icon: boleto,
    paymentMethodId: 'boleto',
  },
]

export function PaymentMethods() {
  return (
    <div className="flex flex-row gap-2">
      {PAYMENT_METHODS.map((paymentMethod) => (
        <Image
          key={paymentMethod.paymentMethodId}
          src={paymentMethod.icon}
          alt={paymentMethod.label}
          title={paymentMethod.label}
          className="w-7"
        />
      ))}
    </div>
  )
}
