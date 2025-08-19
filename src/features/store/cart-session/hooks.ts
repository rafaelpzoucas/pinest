'use client'

import { UseMutationOptions } from '@/features/types'

import { useCart } from '@/stores/cart-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { addProductToCart } from './add-product'
import { clearCartSession } from './clear'
import { getStoreCartSession } from './get-cart-session'
import { readCart } from './read'
import { readCartItem } from './read-item'
import { removeStoreCartProduct } from './remove-product'
import {
  AddToCart,
  AddToCartSchema,
  ClearCartSession,
  ClearCartSessionSchema,
  RemoveCartItem,
  RemoveCartItemSchema,
  UpdateCartItem,
  UpdateCartItemSchema,
} from './schemas'
import { updateStoreCartProduct } from './update-product'

interface Props {
  subdomain?: string
}

export function useReadCart({ subdomain }: Props) {
  const { setCart } = useCart()

  return useQuery({
    queryKey: ['cart-session'],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('subdomain are required')
      }

      const [data, error] = await readCart({ subdomain })

      if (error) {
        throw new Error('não foi possivel buscar o carrinho', error as Error)
      }

      setCart(data.cart)

      return data
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useReadCartItem({ cartItemId }: { cartItemId: string }) {
  const { setCurrentCartItem } = useCart()

  return useQuery({
    queryKey: ['cart-item', cartItemId],
    queryFn: async () => {
      if (!cartItemId) {
        throw new Error('cartItemId are required')
      }

      const [data, error] = await readCartItem({ cartItemId })

      if (error) {
        throw new Error('não foi possivel buscar o carrinho', error as Error)
      }

      setCurrentCartItem(data.cartItem)

      return data
    },
    enabled: !!cartItemId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

export function useProductExtras({ subdomain }: Props) {
  return useQuery({
    queryKey: ['product-extras', subdomain],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('subdomain are required')
      }

      const cartSession = await getStoreCartSession(subdomain)

      if (!cartSession) {
        console.log('Nenhum carrinho foi encontrado.')
      }

      return cartSession
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })
}

export function useAddToCart(options?: UseMutationOptions) {
  const queryClient = useQueryClient()
  const { resetCurrentCartItem } = useCart()

  return useMutation({
    mutationFn: async (data: AddToCart) => {
      const parsed = AddToCartSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error('Error validating input on useAddToCart: ', parsed.data)
      }

      await addProductToCart(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart-session'] })

      resetCurrentCartItem()

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Ocorreu um erro, tente novamente')
      console.error(error)
      options?.onError?.(error)
    },
  })
}

export function useUpdateCartProduct(options?: UseMutationOptions) {
  const queryClient = useQueryClient()
  const { resetCurrentCartItem } = useCart()

  return useMutation({
    mutationFn: async (data: UpdateCartItem) => {
      const parsed = UpdateCartItemSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useUpdateCartProduct: ',
          parsed.error,
        )
      }

      await updateStoreCartProduct(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart-session'] })

      resetCurrentCartItem()

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produto no carrinho.')
      console.error(error)
      options?.onError?.(error)
    },
  })
}

export function useRemoveCartProduct(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RemoveCartItem) => {
      const parsed = RemoveCartItemSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useUpdateCartProduct: ',
          parsed.error,
        )
      }

      await removeStoreCartProduct(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart-session'] })
      toast.success('Produto removido do carrinho.')

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Erro ao remover produto do carrinho.')
      console.error(error)
      options?.onError?.(error)
    },
  })
}

export function useClearCartSession(options?: UseMutationOptions) {
  const queryClient = useQueryClient()
  const { setCart } = useCart()

  return useMutation({
    mutationFn: async (data: ClearCartSession) => {
      const parsed = ClearCartSessionSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useUpdateCartProduct: ',
          parsed.error,
        )
      }

      await clearCartSession(data.cartSessionId as string)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart-session'] })

      setCart([])

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Erro ao remover produto do carrinho.')
      console.error(error)
      options?.onError?.(error)
    },
  })
}
