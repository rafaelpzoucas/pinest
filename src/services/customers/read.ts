import { StoreCustomerType } from '@/models/store-customer'

export async function fetchStoreCustomers(storeId: string) {
  const res = await fetch(`/api/v1/store/customers?storeId=${storeId}`)

  if (!res.ok) {
    throw new Error(`Erro ao buscar clientes: ${res.status}`)
  }

  const { customers } = await res.json()

  return customers as StoreCustomerType[]
}
