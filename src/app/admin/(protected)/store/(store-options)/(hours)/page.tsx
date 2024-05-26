import { readHours } from './actions'
import { HoursForm } from './form'

export default async function HoursPage() {
  const { data: hours, error } = await readHours()

  if (error) {
    return null
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Horário de funcionamento</h1>

      <HoursForm hours={hours} />
    </div>
  )
}
