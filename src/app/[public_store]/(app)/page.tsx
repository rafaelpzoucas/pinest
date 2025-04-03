import { readOpeningHours } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { readStore } from '../actions'
import { readCart } from '../cart/actions'
import { Categories } from './categories'
import { readCategories } from './categories/actions'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { readProductsByCategory } from './productsList/actions'
import { Showcases } from './showcases'
import { readShowcases } from './showcases/actions'

export default async function HomePage() {
  const [
    [storeData],
    [cartData],
    [categoriesData],
    [hoursData],
    [productsData],
    [showcasesData],
  ] = await Promise.all([
    readStore(),
    readCart(),
    readCategories(),
    readOpeningHours(),
    readProductsByCategory(),
    readShowcases(),
  ])

  const store = storeData?.store
  const cart = cartData?.cart
  const hours = hoursData?.hours
  const categories = categoriesData?.categories
  const products = productsData?.categories
  const showcases = showcasesData?.showcasesWithProducts

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
