import { cn } from '@/lib/utils'
import { AddToCart } from './add-to-cart'
import { Cart } from './cart'
import { FinishOrder } from './finish-order/finish-order'
import { Navbar } from './nav'

export function BottomActionBar() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20">
      <div className={cn('flex flex-col w-full max-w-md mx-auto')}>
        <Cart />
        <AddToCart />
        <FinishOrder />
        <Navbar />
      </div>
    </footer>
  )
}
