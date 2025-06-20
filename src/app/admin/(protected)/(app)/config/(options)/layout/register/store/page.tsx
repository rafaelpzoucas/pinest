import { AdminHeader } from '@/app/admin-header'
import { readStore } from '../../actions'
import { readMarketNiches } from './actions'
import { StoreForm } from './form'
import { LogoAvatar } from './logo-avatar'

export default async function StoreRegister() {
  const [storeData] = await readStore()
  const { marketNiches, readNichesError } = await readMarketNiches()

  const store = storeData?.store

  if (!storeData) {
    console.error('Erro ao buscar informações da loja.')
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
