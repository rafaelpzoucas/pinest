import { Categories } from './categories'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { Showcases } from './showcases'

export default async function HomePage() {
  return (
    <div className="w-full space-y-8">
      <Header />
      <Categories />
      <Showcases />
      <ProductsList />
      <Footer />
    </div>
  )
}
