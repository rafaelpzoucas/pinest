import { AdminHeader } from '@/components/admin-header'
import { readShowcaseById } from './actions'
import { ShowcaseForm } from './form'

export default async function ShowcasesRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { showcase, readShowcaseError } = await readShowcaseById(
    searchParams.id,
  )

  if (readShowcaseError) {
    console.error(readShowcaseError)
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`${showcase ? 'Editar' : 'Nova'} vitrine`}
        withBackButton
      />

      <ShowcaseForm showcase={showcase} />
    </div>
  )
}
