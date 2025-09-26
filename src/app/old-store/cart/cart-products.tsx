import { CartProductType } from '@/models/cart'
import { StoreType } from '@/models/store'
import { ShoppingBag } from 'lucide-react'
import { CartProduct } from './cart-product'

export function CartProducts({
  cartProducts,
  store,
}: {
  cartProducts?: CartProductType[]
  store?: StoreType | null
}) {
  return (
    <div className="lg:h-[370px] p-1 pr-2">
      {cartProducts && cartProducts.length > 0 ? (
        cartProducts.map((product) => (
          <CartProduct
            key={product.id}
            cartProduct={product}
            storeSubdomain={store?.store_subdomain}
          />
        ))
      ) : (
        <div
          className="flex flex-col gap-4 items-center justify-center max-w-xs mx-auto h-full
            text-muted py-4"
        >
          <ShoppingBag className="w-20 h-20" />
          <p className="text-center text-muted-foreground">
            Você não possui produtos no carrinho
          </p>
        </div>
      )}
    </div>
  )
}
