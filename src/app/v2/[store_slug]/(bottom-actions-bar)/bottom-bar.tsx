'use client'

import { cn } from '@/lib/utils'
import { AddToCart } from './add-to-cart'
import { Cart } from './cart'
import { FinishOrder } from './finish-order'
import { useBottomAction } from './hooks'
import { Navbar } from './nav'

export function BottomActionBar() {
  const { config } = useBottomAction()

  // Se nenhum dos componentes deve ser mostrado, não renderiza nada
  if (!config.showCart && !config.showAddToCart && !config.showFinishOrder) {
    return null
  }

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
