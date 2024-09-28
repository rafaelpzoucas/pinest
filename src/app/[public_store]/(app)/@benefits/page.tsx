import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCircle } from 'lucide-react'
import { readBenefitsByStoreId } from './actions'

export default async function Benefits({
  params,
}: {
  params: { public_store: string }
}) {
  const { benefits, readBenefitsError } = await readBenefitsByStoreId(
    params.public_store,
  )

  if (readBenefitsError) {
    console.error(readBenefitsError)
  }

  return (
    <section className="grid grid-cols-2 lg:flex flex-row justify-around py-4 gap-4">
      {benefits &&
        benefits.length > 0 &&
        benefits.map((benefit) => (
          <div
            key={benefit.id}
            className="flex flex-col items-center justify-center"
          >
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-transparent">
                <CheckCircle className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>

            <div className="text-center">
              <strong className="text-center">{benefit.name}</strong>
              <p className="text-xs text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
    </section>
  )
}
