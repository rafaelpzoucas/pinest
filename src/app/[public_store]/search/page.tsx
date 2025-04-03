import { ProductCard } from '@/components/product-card'
import { Header } from '@/components/store-header'
import { createClient } from '@/lib/supabase/server'
import { Search } from 'lucide-react'
import { readStore } from '../actions'
import { readCart, readStripeConnectedAccountByStoreUrl } from '../cart/actions'
import { getSearchedProducts } from './actions'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const supabase = createClient()

  const [[searchData], [storeData], [cartData], { data: userData }] =
    await Promise.all([
      getSearchedProducts({ query: searchParams.q }),
      readStore(),
      readCart(),
      supabase.auth.getUser(),
    ])

  const products = searchData?.products
  const store = storeData?.store
  const cart = cartData?.cart

  const { user } = await readStripeConnectedAccountByStoreUrl(
    store?.store_subdomain,
  )

  const connectedAccount = user?.stripe_connected_account

  return (
    <div className="space-y-6 lg:space-y-8">
      <Header
        store={store}
        cartProducts={cart}
        userData={userData}
        connectedAccount={connectedAccount}
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full">
          <h1 className="text-2xl">&quot;{searchParams.q}&quot;</h1>

          <p className="text-xs lg:text-base text-muted-foreground">
            {products && products.length} resultado(s) encontrado(s)
          </p>

          <section className="flex flex-col gap-8 pt-4 pb-16 w-full">
            <div className="flex flex-col">
              {products && products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      variant={'featured'}
                      data={product}
                      className="hover:scale-105 focus:scale-105 delay-300 transition-all duration-300"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto text-muted">
                  <Search className="w-20 h-20" />
                  <p className="text-center text-muted-foreground">
                    Não encontramos nenhum resultado para &quot;
                    {searchParams.q}
                    &quot;
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
