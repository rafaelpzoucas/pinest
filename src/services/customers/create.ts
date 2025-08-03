import { CreateStoreCustomerType } from '@/actions/store/customers/schemas'
import { StoreCustomerType } from '@/models/store-customer'

export async function createStoreCustomer(values: CreateStoreCustomerType) {
  const body = JSON.stringify(values)

  const res = await fetch('/api/v1/store/customers/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    throw new Error(`Erro ao criar novo cliente: ${res.status}`)
  }

  const data = await res.json()

  return {
    createdStoreCustomer: data.createdStoreCustomer as StoreCustomerType,
  }
}
