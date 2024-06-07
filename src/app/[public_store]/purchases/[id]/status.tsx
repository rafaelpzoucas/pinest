import { Card } from '@/components/ui/card'
import { PurchaseType } from '@/models/purchase'

export function Status({ purchase }: { purchase: PurchaseType }) {
  return (
    <Card className="p-4">
      <span>{purchase?.status}</span>
      <p>Chegou no dia {purchase?.created_at}</p>
      <p>
        Seu pacote foi entregue às 11h30 na Rua Santa Cruz, 801 - centro
        Assis/SP
      </p>
    </Card>
  )
}
