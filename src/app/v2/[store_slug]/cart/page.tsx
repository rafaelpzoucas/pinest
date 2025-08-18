import { readCart } from '@/features/store/cart-session/read'
import { CartProducts } from './cart-products'

export default async function CartPage({
  params,
}: {
  params: { store_slug: string }
}) {
  const [cartData] = await readCart({ subdomain: params.store_slug as string })

  return (
    <main className="mt-[68px] p-4 flex flex-col pb-32">
      <CartProducts cart={cartData?.cart} storeSlug={params.store_slug} />
    </main>
  )
}
