import { UseMutationOptions } from '@/features/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAdminAddress } from './create'
import { CreateAddressInput, UpdateAddressInput } from './schemas'
import { updateAdminAddress } from './update'

export const useCreateAdminAddress = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAddressInput) => {
      const [data, error] = await createAdminAddress(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-address'] })
      toast.success('Address created successfuly!')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create address')
      console.error('Create store error:', error)

      options?.onError?.(error)
    },
  })
}

export const useUpdateAdminAddress = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateAddressInput) => {
      const [data, error] = await updateAdminAddress(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-address'] })
      toast.success('Address updated successfuly!')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update store address')
      console.error('Update store address error:', error)

      options?.onError?.(error)
    },
  })
}
