import { readOpeningHoursCached } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { readStoreCached } from '../actions'
import { readCartCached } from '../cart/actions'
import { Categories } from './categories'
import { readCategoriesCached } from './categories/actions'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { readProductsByCategoryCached } from './productsList/actions'
import { Showcases } from './showcases'
import { readShowcasesCached } from './showcases/actions'

export default async function HomePage() {
  console.time('HomePage')

  console.time('fetchAllData')
  const [
    [storeData],
    [cartData],
    [categoriesData],
    [hoursData],
    [productsData],
    [showcasesData],
  ] = await Promise.all([
    readStoreCached(),
    readCartCached(),
    readCategoriesCached(),
    readOpeningHoursCached(),
    readProductsByCategoryCached(),
    readShowcasesCached(),
  ])
  console.timeEnd('fetchAllData')

  console.time('dataProcessing')
  const store = storeData?.store
  const cart = cartData?.cart
  const hours = hoursData?.hours
  const categories = categoriesData?.categories
  const products = productsData?.categories
  const showcases = showcasesData?.showcasesWithProducts
  console.timeEnd('dataProcessing')

  console.timeEnd('HomePage')
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
