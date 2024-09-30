import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
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
    return null
  }

  if (benefits?.length === 0) {
    return null
  }

  return (
    <Card className="bg-secondary/50 border-0">
      <section className="grid grid-cols-2 lg:flex flex-row justify-around p-4 gap-4">
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
    </Card>
  )
}
