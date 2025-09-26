'use client'

import { UseMutationOptions } from '@/features/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createStoreCustomer } from './create'
import { readCustomer } from './read'
import {
  CreateCustomer,
  CreateCustomerSchema,
  UpdateCustomer,
  UpdateCustomerSchema,
} from './schemas'
import { updateStoreCustomer } from './update'

interface UseReadCustomerParams {
  phone?: string
  subdomain: string
}

export function useReadCustomer({ subdomain, phone }: UseReadCustomerParams) {
  return useQuery({
    queryKey: ['customer', phone, subdomain],
    queryFn: async () => {
      if (!subdomain) {
        throw new Error('subdomain are required')
      }

      const [data, error] = await readCustomer({
        phone,
        subdomain,
      })

      if (error) {
        throw error
      }

      return data
    },
    enabled: !!subdomain,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  })
}

export function useCreateStoreCustomer(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCustomer) => {
      const parsed = CreateCustomerSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useCreateStoreCustomer: ',
          parsed.error,
        )
      }

      await createStoreCustomer(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['store-customer'] })

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Ocorreu um erro, tente novamente')
      console.error(error)
      options?.onError?.(error)
    },
  })
}

export function useUpdateStoreCustomer(options?: UseMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateCustomer) => {
      const parsed = UpdateCustomerSchema.safeParse(data)

      if (!parsed.success) {
        throw new Error(
          'Error validating input on useUpdateStoreCustomer: ',
          parsed.error,
        )
      }

      await updateStoreCustomer(data)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['store-customer'] })

      options?.onSuccess?.(data)
    },
    onError: (error) => {
      toast.error('Ocorreu um erro, tente novamente')
      console.error(error)
      options?.onError?.(error)
    },
  })
}
