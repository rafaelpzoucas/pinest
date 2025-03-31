import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StoreType } from '@/models/store'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { readStoreHours } from './actions'
import { HoursList } from './register/hours/hours-list'

export async function Hours({ store }: { store: StoreType | null }) {
  if (!store) {
    return null
  }

  const [hoursData] = await readStoreHours()

  const hours = hoursData?.hours

  if (!hours) {
    return null
  }

  return (
    <Card className="relative flex flex-col gap-4 p-4">
      <h3 className="text-lg font-bold">Horário de atendimento</h3>

      <HoursList hours={hours} />

      <Link
        href={`layout/register/hours`}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'absolute top-2 right-2',
        )}
      >
        <Edit className="w-4 h-4" />
      </Link>
    </Card>
  )
}
