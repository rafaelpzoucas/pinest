import { redirect } from 'next/navigation'
import { readStoreCached } from '../config/(options)/layout/actions'
import { getSalesReportCached } from '../reports/actions'
import { SalesReport } from '../reports/sales-report'
import { FirstSteps } from './first-steps'
import { PendingBalances } from './pending-balances'
import { ProfileCard } from './profile'
import { TodaySummary } from './today-summary'

export default async function DashboardPage() {
  const [storeData] = await readStoreCached()
  const [reports] = await getSalesReportCached({
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  })

  const store = storeData?.store

  if (!store) {
    redirect('/admin/onboarding/store/basic')
  }

  return (
    <div className="p-4 lg:px-0 space-y-6 pb-16">
      <section className="columns-1 lg:columns-3 gap-4 space-y-4 w-full max-w-7xl">
        <ProfileCard store={store} />

        <FirstSteps />
        <TodaySummary />
        <SalesReport data={reports?.salesReport} />
        <PendingBalances />
        {/* <TotalSales /> */}
      </section>
    </div>
  )
}
