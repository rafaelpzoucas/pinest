import { AdminHeader } from '@/app/admin-header'
import { DatePicker } from '@/components/ui/date-picker'
import { endOfDay, startOfDay } from 'date-fns'
import { getSalesReportCached } from './actions'
import { ProductsSoldReport } from './products-sold'
import { SalesReport } from './sales-report'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { start_date: string; end_date: string }
}) {
  const startDate = startOfDay(
    searchParams.start_date || new Date(),
  ).toISOString()
  const endDate = endOfDay(searchParams.start_date || new Date()).toISOString()

  const [reports] = await getSalesReportCached({
    start_date: startDate,
    end_date: endDate,
  })

  return (
    <main className="space-y-6 p-4 lg:px-0">
      <AdminHeader title="Relatórios" />

      <DatePicker />
      <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
        <SalesReport data={reports?.salesReport} />
        <ProductsSoldReport data={reports?.productsSold} />
      </div>
    </main>
  )
}
