import { PaymentType } from '@/models/payment'
import { endOfDay, startOfDay } from 'date-fns'
import { DollarSign } from 'lucide-react'
import { getSalesReport } from '../reports/actions'
import {
  readCashReceipts,
  readCashSession,
  readCashSessionPayments,
  readOpenPurchases,
  readOpenTables,
} from './actions'
import { CloseCashSession } from './close'
import { CreateTransactionForm } from './create-transaction-form'
import { columns } from './data-table/columns'
import { DataTable } from './data-table/table'
import { OpenCashSession } from './open'
import { CashRegisterSummary } from './summary'

export default async function CashRegister() {
  const today = new Date()

  const [
    [cashSessionData],
    [paymentsData],
    [openPurchasesData],
    [openTablesData],
    [cashReceiptsData],
    [reportsData],
  ] = await Promise.all([
    readCashSession(),
    readCashSessionPayments(),
    readOpenPurchases(),
    readOpenTables(),
    readCashReceipts(),
    getSalesReport({
      start_date: startOfDay(today).toISOString(),
      end_date: endOfDay(today).toISOString(),
    }),
  ])

  const cashSession = cashSessionData?.cashSession
  const payments: PaymentType[] = paymentsData?.payments || []
  const cashReceipts = cashReceiptsData?.cashReceipts

  const hasOpenPurchases =
    (openPurchasesData?.openPurchases?.length as number) > 0
  const hasOpenTables = (openTablesData?.openTables?.length as number) > 0

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
    <div className="space-y-6 p-4 pb-16 lg:px-0 w-screen lg:w-full">
      <div>
        {!cashSession && (
          <section className="space-y-6">
            <OpenCashSession />

            <div
              className="w-full h-full flex flex-col gap-6 items-center justify-center
                text-muted-foreground text-center"
            >
              <DollarSign className="w-32 h-32" />
              <p className="max-w-md">
                O caixa ainda não foi aberto. Inicie uma sessão para registrar o
                fluxo de entradas e saídas.
              </p>
            </div>
          </section>
        )}
        {cashSession && (
          <section className="space-y-6">
            <header className="flex flex-row gap-4">
              <CloseCashSession
                cashSessionId={cashSession.id}
                hasOpenPurchases={hasOpenPurchases}
                hasOpenTables={hasOpenTables}
                cashReceipts={cashReceipts}
                payments={payments}
                reports={reportsData}
              />

              <CreateTransactionForm />
            </header>

            <div className="flex flex-col-reverse lg:grid lg:grid-cols-[2fr_1fr] items-start gap-4">
              <DataTable data={payments} columns={columns} />

              <aside className="lg:sticky top-4 w-full lg:w-auto">
                <CashRegisterSummary payments={payments} />
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
