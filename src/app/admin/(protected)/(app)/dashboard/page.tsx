import { AdminHeader } from '@/components/admin-header'
import { redirect } from 'next/navigation'
import { readStore } from './actions'
import { FirstSteps } from './first-steps'
import { ProfileCard } from './profile'
import { TodaySummary } from './today-summary'
import { TotalSales } from './total-sales'

export default async function DashboardPage() {
  const { store, storeError } = await readStore()

  if (storeError) {
    console.error(storeError)
  }

  if (!store) {
    redirect('/admin/onboarding/store/basic')
  }

  return (
    <div className="p-4 lg:px-0 space-y-6">
      <AdminHeader title="Dashboard" />

      <section className="flex flex-row gap-4">
        <ProfileCard store={store} />

        <FirstSteps />
      </section>

      <section className="flex flex-col lg:flex-row items-start justify-start gap-6 w-full max-w-7xl">
        <TodaySummary />
        <TotalSales />
      </section>
    </div>
  )
}
