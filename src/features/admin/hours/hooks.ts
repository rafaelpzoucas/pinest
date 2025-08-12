import { UseMutationOptions } from '@/features/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAdminStoreHours } from './create'
import { CreateStoreHours, UpdateStoreHours } from './schemas'
import { updateAdminStoreHours } from './update'

export const useCreateAdminStoreHours = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateStoreHours) => {
      const [data, error] = await createAdminStoreHours(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['store-hours'] })
      toast.success('Store Hours created successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to create store hours')
      console.error('Create store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useUpdateAdminStoreHours = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateStoreHours) => {
      const [data, error] = await updateAdminStoreHours(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['store-hours'] })
      toast.success('Store Hours updated successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to update store hours')
      console.error('Update store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}
