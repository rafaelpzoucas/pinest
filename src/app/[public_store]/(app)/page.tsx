import { readPublicStoreData } from './actions'
import { Categories } from './categories'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { Showcases } from './showcases'

export default async function HomePage() {
  const [publicStoreData] = await readPublicStoreData()

  const store = publicStoreData?.store
  const cart = publicStoreData?.cart
  const hours = publicStoreData?.store.store_hours
  const categories = publicStoreData?.categories
  const products = publicStoreData?.categories
  const showcases = publicStoreData?.showcases

  return (
    <div className="w-full space-y-8">
      <Header store={store} cart={cart ?? []} />
      <Categories categories={categories} />
      <Showcases showcases={showcases} store={store} />
      <ProductsList categories={products} store={store} />
      <Footer store={store} hours={hours} categories={categories} />
    </div>
  )
}
