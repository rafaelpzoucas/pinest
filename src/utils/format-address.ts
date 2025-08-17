import { Address } from '@/features/admin/address/schemas'

export function formatStoreAddress(address?: Address): string | null {
  if (!address) return null

  const { street, number, complement, neighborhood } = address

  const parts = [
    `${street}, ${number}`,
    complement,
    neighborhood ? `- ${neighborhood}` : null,
  ]

  return parts.filter(Boolean).join(' ')
}
