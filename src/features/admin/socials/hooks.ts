import { UseMutationOptions } from '@/features/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAdminStoreSocials } from './create'
import { deleteAdminStoreSocial } from './delete'
import {
  CreateAdminStoreSocials,
  DeleteAdminStoreSocials,
  UpdateAdminStoreSocials,
} from './schemas'
import { updateAdminStoreSocials } from './update'

export const useCreateAdminStoreSocials = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAdminStoreSocials) => {
      const [data, error] = await createAdminStoreSocials(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['store-socials'] })
      toast.success('Store Socials created successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to create store Socials')
      console.error('Create store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useUpdateAdminStoreSocials = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateAdminStoreSocials) => {
      const [data, error] = await updateAdminStoreSocials(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['store-socials'] })
      toast.success('Store Socials updated successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to update store Socials')
      console.error('Update store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}

export const useDeleteAdminStoreSocial = (options?: UseMutationOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: DeleteAdminStoreSocials) => {
      const [data, error] = await deleteAdminStoreSocial(payload)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (data) => {
      // Comportamento padrão
      queryClient.invalidateQueries({ queryKey: ['store-socials'] })
      toast.success('Store Socials deleted successfully!')

      // Callback customizado do contexto
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      // Comportamento padrão
      toast.error(error.message || 'Failed to delete store Socials')
      console.error('Delete store error:', error)

      // Callback customizado do contexto
      options?.onError?.(error)
    },
    onSettled: () => {
      options?.onSettled?.()
    },
  })
}
