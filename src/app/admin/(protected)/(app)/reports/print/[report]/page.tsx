import { endOfDay, startOfDay } from 'date-fns'
import { getSalesReportCached } from '../../actions'
import { Printer } from '../printer'
import { ProductsSoldReportPrint } from './products-sold'
import { SalesReportPrint } from './sales'

export default async function CashRegisterPrint({
  params,
  searchParams,
}: {
  params: { report: 'sales' | 'products-sold' }
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
    <div
      className="hidden print:flex flex-col items-center justify-center text-[0.625rem]
        text-black print-container m-4 space-y-6"
    >
      {params.report === 'sales' && (
        <SalesReportPrint data={reports?.salesReport} />
      )}

      {params.report === 'products-sold' && (
        <ProductsSoldReportPrint data={reports?.productsSold} />
      )}
      <Printer />
    </div>
  )
}
