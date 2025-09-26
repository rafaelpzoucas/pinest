import { PaymentType } from '@/models/payment'
import { DollarSign } from 'lucide-react'
import { getSalesReportByCashSessionId } from '../reports/actions'
import {
  readCashReceiptsCached,
  readCashSessionCached,
  readCashSessionPaymentsCached,
  readOpenOrdersCached,
  readOpenTablesCached,
} from './actions'
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
    [openOrdersData],
    [openTablesData],
    [cashReceiptsData],
    [reportsData],
  ] = await Promise.all([
    readCashSessionCached(),
    readCashSessionPaymentsCached(),
    readOpenOrdersCached(),
    readOpenTablesCached(),
    readCashReceiptsCached(),
    getSalesReportByCashSessionId(),
  ])

  const cashSession = cashSessionData?.cashSession
  const payments: PaymentType[] = paymentsData?.payments || []
  const cashReceipts = cashReceiptsData?.cashReceipts

  const hasOpenOrders = (openOrdersData?.openOrders?.length as number) > 0
  const hasOpenTables = (openTablesData?.openTables?.length as number) > 0

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
              <CreateTransactionForm />
            </header>

            <div className="flex flex-col-reverse lg:grid lg:grid-cols-[2fr_1fr] items-start gap-4">
              <DataTable data={payments} columns={columns} />

              <aside className="lg:sticky top-4 w-full lg:w-auto">
                <CashRegisterSummary
                  payments={payments}
                  hasOpenOrders={hasOpenOrders}
                  hasOpenTables={hasOpenTables}
                  cashReceipts={cashReceipts}
                  reports={reportsData}
                />
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
