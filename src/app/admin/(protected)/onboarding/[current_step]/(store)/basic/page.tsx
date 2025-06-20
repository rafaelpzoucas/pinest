import { readMarketNiches } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/store/actions'
import { StoreForm } from '@/app/admin/(protected)/(app)/config/(options)/layout/register/store/form'

export default async function StoreBasicInformations() {
  const { marketNiches, readNichesError } = await readMarketNiches()

  if (readNichesError) {
    console.error(readNichesError)
  }

  return (
    <div className="flex flex-col gap-4 pb-16">
      <h1 className="text-3xl font-bold">Informações básicas da loja</h1>

      <StoreForm marketNiches={marketNiches} />
    </div>
  )
}
