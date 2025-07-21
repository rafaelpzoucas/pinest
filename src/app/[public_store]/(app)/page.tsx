import { StoreHydrator } from '../hydrator'
import { readPublicStoreData } from './actions'
import { Categories } from './categories'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { Showcases } from './showcases'

export default async function HomePage() {
  const [publicStoreData] = await readPublicStoreData()

  if (!publicStoreData) {
    return <div>Erro ao carregar dados</div>
  }

  return (
    <div className="w-full space-y-8">
      <StoreHydrator publicStoreData={publicStoreData} />

      <Header />
      <Categories />
      <Showcases />
      <ProductsList />
      <Footer />
    </div>
  )
}
