import { Categories } from './categories'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { Showcases } from './showcases'

export default function HomePage({
  params,
}: {
  params: { public_store: string }
}) {
  return (
    <div className="w-full space-y-8">
      <Header storeURL={params.public_store} />
      <Categories storeURL={params.public_store} />
      <Showcases storeURL={params.public_store} />
      <ProductsList storeURL={params.public_store} />
      <Footer storeURL={params.public_store} />
    </div>
  )
}
