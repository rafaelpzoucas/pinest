import { CartProducts } from './cart-products'

export default async function CartPage({
  params,
}: {
  params: { store_slug: string }
}) {
  return (
    <main className="mt-[68px] p-4 flex flex-col pb-32">
      <CartProducts storeSlug={params.store_slug} />
    </main>
  )
}
