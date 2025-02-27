import { AdminHeader } from '@/app/admin-header'
import { readMarketNiches, readStoreById } from './actions'
import { StoreForm } from './form'
import { LogoAvatar } from './logo-avatar'

export default async function StoreRegister({
  searchParams,
}: {
  searchParams: { id: string }
}) {
  const { store, storeError } = await readStoreById(searchParams?.id)
  const { marketNiches, readNichesError } = await readMarketNiches()

  if (storeError) {
    console.error(storeError)
  }

  if (readNichesError) {
    console.error(readNichesError)
  }

  return (
    <section className="flex flex-col gap-4">
      <AdminHeader title="Editar loja" withBackButton />

      <LogoAvatar store={store} />

      <StoreForm store={store} marketNiches={marketNiches} />
    </section>
  )
}
