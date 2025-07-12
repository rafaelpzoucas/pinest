import { readOpeningHoursCached } from '@/app/admin/(protected)/(app)/config/(options)/account/actions'
import { readStoreCached } from '../actions'
import { readCartCached } from '../cart/actions'
import { generateRequestId, logCpu } from '../utils'
import { Categories } from './categories'
import { readCategoriesCached } from './categories/actions'
import { Footer } from './footer'
import { Header } from './header'
import { ProductsList } from './productsList'
import { readProductsByCategoryCached } from './productsList/actions'
import { Showcases } from './showcases'
import { readShowcasesCached } from './showcases/actions'

export default async function HomePage() {
  const requestId = generateRequestId()

  return await logCpu(`${requestId}::HomePage`, async () => {
    const [
      [storeData],
      [cartData],
      [categoriesData],
      [hoursData],
      [productsData],
      [showcasesData],
    ] = await logCpu(`${requestId}::fetchAllData`, async () => {
      return await Promise.all([
        readStoreCached(),
        readCartCached(),
        readCategoriesCached(),
        readOpeningHoursCached(),
        readProductsByCategoryCached(),
        readShowcasesCached(),
      ])
    })

    const { store, cart, hours, categories, products, showcases } = {
      store: storeData?.store,
      cart: cartData?.cart,
      hours: hoursData?.hours,
      categories: categoriesData?.categories,
      products: productsData?.categories,
      showcases: showcasesData?.showcasesWithProducts,
    }

    return (
      <div className="w-full space-y-8">
        <Header store={store} cart={cart ?? []} />
        <Categories categories={categories} />
        <Showcases showcases={showcases} store={store} />
        <ProductsList categories={products} store={store} />
        <Footer store={store} hours={hours} categories={categories} />
      </div>
    )
  })
}
