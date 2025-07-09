import { formatCurrencyBRL } from '@/lib/utils'
import { PaymentType } from '@/models/payment'
import { endOfDay, startOfDay } from 'date-fns'
import { getSalesReportCached } from '../../reports/actions'
import { ProductsSoldReportPrint } from '../../reports/print/[report]/products-sold'
import { readPaymentsByCashSessionId } from '../actions'
import { Printer } from './printer'

export default async function CashRegisterPrint({
  searchParams,
}: {
  searchParams: { cash_session_id: string }
}) {
  const today = new Date()
  const [[reports], [paymentsData]] = await Promise.all([
    getSalesReportCached({
      start_date: startOfDay(today).toISOString(),
      end_date: endOfDay(today).toISOString(),
    }),
    readPaymentsByCashSessionId({
      cashSessionId: searchParams.cash_session_id,
    }),
  ])

  const payments: PaymentType[] = paymentsData?.payments || []
  const productsSold = reports?.productsSold

  const initialAmount = payments.find(
    (payment) => payment.description === 'Abertura de caixa',
  )?.amount

  const incomePayments = payments.filter(
    (payments) => payments.type === 'INCOME',
  )
  const expensePayments = payments.filter(
    (payments) => payments.type === 'EXPENSE',
  )

  const incomeTotals = incomePayments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT: 'Cartão de crédito',
        DEBIT: 'Cartão de débito',
        CASH: 'Dinheiro',
        PIX: 'PIX',
        DEFERRED: 'Prazo',
      } as const

      const key = typeMap[payment.payment_type as keyof typeof typeMap]

      if (key) {
        acc[key] = (acc[key] || 0) + payment.amount
      }

      return acc
    },
    {} as Record<string, number>,
  )

  const expenseTotals = expensePayments.reduce(
    (acc, payment) => {
      const typeMap = {
        CREDIT: 'Cartão de crédito',
        DEBIT: 'Cartão de débito',
        CASH: 'Dinheiro',
        PIX: 'PIX',
        DEFERRED: 'Prazo',
      } as const

      const key = typeMap[payment.payment_type as keyof typeof typeMap]

      if (key) {
        acc[key] = (acc[key] || 0) + payment.amount
      }

      return acc
    },
    {} as Record<string, number>,
  )

  const totalIncome = Object.values(incomePayments).reduce(
    (acc, value) => acc + value.amount,
    0,
  )
  const totalExpense = Object.values(expensePayments).reduce(
    (acc, value) => acc + value.amount,
    0,
  )
  const cashBalance =
    (initialAmount || 0) +
    (incomeTotals.Dinheiro || 0) -
    (expenseTotals.Dinheiro || 0)
  const totalBalance = totalIncome - totalExpense

  return (
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4 space-y-6"
    >
      <header className="flex flex-col items-center justify-center w-full">
        <h1 className="uppercase">Resumo do caixa</h1>
      </header>
      <section className="space-y-4 w-full">
        <header className="flex flex-row items-center justify-between">
          <span>Saldo inicial</span>
          <span>{formatCurrencyBRL(initialAmount ?? 0)}</span>
        </header>

        <div>
          <h3>Entradas</h3>

          {Object.keys(incomeTotals).map((key) => {
            const typedKey = key as keyof typeof incomeTotals
            return (
              <div
                key={key}
                className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
                  border-dotted"
              >
                <span>{key}</span>
                <span>{formatCurrencyBRL(incomeTotals[typedKey])}</span>
              </div>
            )
          })}

          <footer className="flex flex-row items-center justify-between">
            <span>Total</span>
            <span>{formatCurrencyBRL(totalIncome ?? 0)}</span>
          </footer>
        </div>
        <div>
          <h3>Saídas</h3>

          {Object.keys(expenseTotals).map((key) => {
            const typedKey = key as keyof typeof expenseTotals
            return (
              <div
                key={key}
                className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
                  border-dotted"
              >
                <span>{key}</span>
                <span>{formatCurrencyBRL(expenseTotals[typedKey])}</span>
              </div>
            )
          })}

          <footer className="flex flex-row items-center justify-between">
            <span>Total</span>
            <span>{formatCurrencyBRL(totalExpense ?? 0)}</span>
          </footer>
        </div>
      </section>

      <footer className="flex flex-col items-start w-full">
        <h3>Saldo final</h3>

        <div
          className="flex flex-row items-center justify-between text-muted-foreground py-1 border-t
            border-dotted w-full"
        >
          <span>Somente dinheiro</span>
          <span>{formatCurrencyBRL(cashBalance ?? 0)}</span>
        </div>
        <div className="flex flex-row items-center justify-between py-1 border-t border-dotted w-full">
          <span>Tudo</span>
          <span>{formatCurrencyBRL(totalBalance ?? 0)}</span>
        </div>
      </footer>

      <ProductsSoldReportPrint data={productsSold} />

      <Printer />
    </div>
  )
}
