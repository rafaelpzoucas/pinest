import { AdminHeader } from '@/app/admin-header'
import { redirect } from 'next/navigation'
import { getSalesReport } from '../reports/actions'
import { SalesReport } from '../reports/sales-report'
import { readStore } from './actions'
import { FirstSteps } from './first-steps'
import { PendingBalances } from './panding-balances'
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

      <section className="flex flex-col lg:flex-row gap-4">
        <ProfileCard store={store} />

        <FirstSteps />
      </section>

      <section
        className="flex flex-col lg:grid grid-cols-2 items-start justify-start gap-6 w-full
          max-w-7xl"
      >
        <TodaySummary />
        <SalesReport
          data={reports?.salesReport}
          startDate={new Date().toISOString()}
          endDate={new Date().toISOString()}
        />
        <PendingBalances />
        {/* <TotalSales /> */}
      </section>
    </div>
  )
}
