import { useClearCartSession } from '@/features/store/cart-session/hooks'
import { UseMutationOptions } from '@/features/types'
import { useCouponStore } from '@/stores/couponStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createOrderWithoutRedirect } from './create'
import { CreateOrder } from './schemas'

export function useCreateOrder(options?: UseMutationOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { mutate: clearCart } = useClearCartSession()
  const { setAppliedCoupon } = useCouponStore()

  return useMutation({
    mutationFn: async (data: CreateOrder) => {
      const [result, error] = await createOrderWithoutRedirect(data)

      if (error) {
        throw new Error(error.message)
      }

      return { ...result, cartSessionId: data.cart_session_id }
    },

    onSuccess: (data) => {
      // Invalidar queries relacionadas a pedidos
      queryClient.invalidateQueries({
        queryKey: ['orders', 'cart-session'],
      })

      clearCart({ cartSessionId: data.cartSessionId })
      setAppliedCoupon(null)
      // limpar o cupom

      toast.success('Pedido criado com sucesso!')

      // Fazer o redirect no cliente
      if (data?.redirectUrl) {
        router.push(data.redirectUrl)
      }

      options?.onSuccess?.(data)
    },

    onError: (error) => {
      console.error('Erro ao criar pedido:', error)

      toast.error('Erro ao criar pedido')

      options?.onError?.(error)
    },
  })
}
