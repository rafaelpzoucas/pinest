import { redirect } from 'next/navigation'
import { readStore } from './actions'
import { FirstSteps } from './first-steps'
import { ProfileCard } from './profile'
import { TodaySummary } from './today-summary'

export default async function DashboardPage() {
  const { store, storeError } = await readStore()

  if (storeError) {
    console.error(storeError)
  }

  if (!store) {
    redirect('/admin/onboarding?step=1')
  }

  return (
    <main className="space-y-6 p-4">
      <ProfileCard />

      <FirstSteps />

      <TodaySummary />
    </main>
  )
}
