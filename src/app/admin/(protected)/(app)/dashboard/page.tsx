import { AdminHeader } from '@/app/admin-header'
import { redirect } from 'next/navigation'
import { getSalesReport } from '../reports/actions'
import { SalesReport } from '../reports/sales-report'
import { readStore } from './actions'
import { FirstSteps } from './first-steps'
import { PendingBalances } from './pending-balances'
import { ProfileCard } from './profile'
import { TodaySummary } from './today-summary'

export default async function DashboardPage() {
  const { store, storeError } = await readStore()
  const [reports] = await getSalesReport({
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
  })

  if (storeError) {
    console.error(storeError)
  }

  if (!store) {
    redirect('/admin/onboarding/store/basic')
  }

  return (
    <div className="p-4 lg:px-0 space-y-6">
      <AdminHeader title="Dashboard" />

      <section className="flex flex-col lg:flex-row gap-4"></section>

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
