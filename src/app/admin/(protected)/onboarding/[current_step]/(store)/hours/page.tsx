import { BusinessHoursForm } from '@/app/admin/(protected)/(app)/config/(options)/layout/hours/form'

export default function BusinessHours() {
  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Horário de atendimento</h1>

      <BusinessHoursForm />
    </div>
  )
}
