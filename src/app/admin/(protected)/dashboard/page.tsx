import { FirstSteps } from './first-steps'
import { ProfileCard } from './profile'
import { TodaySummary } from './today-summary'

export default async function DashboardPage() {
  return (
    <main className="space-y-6 p-4">
      <ProfileCard />

      <FirstSteps />

      <TodaySummary />
    </main>
  )
}
