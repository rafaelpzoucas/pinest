import { AdminHeader } from '@/components/admin-header'
import { readStoreById } from './actions'
import { StoreForm } from './form'

export default async function StoreRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { store, storeError } = await readStoreById(searchParams?.id)

  if (storeError) {
    console.error(storeError)
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Editar loja" withBackButton />

      <StoreForm store={store} />
    </section>
  )
}
