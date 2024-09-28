import { AdminHeader } from '@/components/admin-header'
import { readBenefitById } from './actions'
import { BenefitForm } from './form'

export default async function BenefitsRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { benefit, readBenefitError } = await readBenefitById(searchParams.id)

  if (readBenefitError) {
    throw new Error(readBenefitError)
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Novo benefício" withBackButton />

      <BenefitForm benefit={benefit} />
    </div>
  )
}
