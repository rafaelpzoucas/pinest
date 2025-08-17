'use client'

import { UseMutationOptions } from '@/features/types'
import { useCouponStore } from '@/stores/couponStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ValidateCoupon, ValidateCouponSchema } from './schemas'
import { validateStoreCoupon } from './validate'

export function useValidateCoupon(options?: UseMutationOptions) {
  const queryClient = useQueryClient()
  const { setAppliedCoupon } = useCouponStore()

  return useMutation({
    mutationFn: async (data: ValidateCoupon) => {
      const parsed = ValidateCouponSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useValidateCoupon: ',
          parsed.error,
        )
      }

      const [res] = await validateStoreCoupon(data)

      return res
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coupon'] })

      toast.success('Cupom aplicado com sucesso!')

      if (data?.valid) {
        toast.success('Cupom aplicado com sucesso!')

        setAppliedCoupon(data)
      } else {
        toast.error(data?.error || 'Cupom inválido.')

        setAppliedCoupon(null)
      }

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Ocorreu um erro, tente novamente')
      console.error(error)

      setAppliedCoupon(null)

      options?.onError?.(error)
    },
  })
}
