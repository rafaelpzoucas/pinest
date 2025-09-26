'use client'

import { usePublicStore } from '@/stores/public-store'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

const getCart = async (subdomain: string) => {
  const res = await fetch(`/api/v1/cart?subdomain=${subdomain}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Erro ao buscar carrinho')
  }

  const data = await res.json()
  return data.cart
}

export function CartInitializer() {
  const { store, updateCart } = usePublicStore()

  const subdomain = store?.store_subdomain

  const { data, isSuccess } = useQuery({
    queryKey: ['cart'],
    queryFn: () => getCart(subdomain as string),
    enabled: !!subdomain,
  })

  useEffect(() => {
    if (isSuccess && data) {
      updateCart(data)
    }
  }, [isSuccess, data, updateCart])

  return null
}
