'use client'

import { useCartStore } from '@/stores/cartStore'
import { useEffect } from 'react'
import { useServerAction } from 'zsa-react'
import { readCartCached } from './actions'

export function CartInitializer() {
  const setCart = useCartStore((s) => s.setCart)

  const { execute } = useServerAction(readCartCached, {
    onSuccess: ({ data }) => {
      setCart(data.cart)
    },
  })

  useEffect(() => {
    execute()
  }, [setCart])

  return null // nada visível
}
