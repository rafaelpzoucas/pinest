import { dayTranslation } from '@/lib/utils'
import { HourType } from '@/models/hour'
import { format } from 'date-fns'

export function HoursList({ hours }: { hours: HourType[] }) {
  return (
    <ul>
      {hours
        .filter((hour) => hour.is_open)
        .map((hour) => {
          const openTime = format(
            new Date(`1970-01-01T${hour.open_time}`),
            'HH:mm',
          )
          const closeTime = format(
            new Date(`1970-01-01T${hour.close_time}`),
            'HH:mm',
          )
          const dayName = dayTranslation[hour.day_of_week]
          return (
            <li key={hour.id}>
              <div className="grid grid-cols-2 gap-2 w-full max-w-72 text-sm text-muted-foreground">
                <span className="text-sm capitalize">{dayName}</span>
                <span>
                  {openTime} às {closeTime}
                </span>
              </div>
            </li>
          )
        })}
    </ul>
  )
}
