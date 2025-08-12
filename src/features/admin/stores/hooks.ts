import { UseMutationOptions } from '@/features/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAdminStore } from './create'
import { CreateAdminStore, UpdateAdminStore } from './schemas'
import { updateAdminStore } from './update'

export const useCreateAdminStore = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAdminStore) => {
      const [data, error] = await createAdminStore(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
      toast.success('Store created successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to create store')
      console.error('Create store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useUpdateAdminStore = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateAdminStore) => {
      const [data, error] = await updateAdminStore(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] })
      toast.success('Store updated successfully!')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update store',
      )
      console.error('Update store error:', error)
      options?.onError?.(error as Error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}
