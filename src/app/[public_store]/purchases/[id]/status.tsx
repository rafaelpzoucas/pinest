import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { PurchaseType } from '@/models/purchase'

const statuses: Record<string, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  approved: 'Aprovado',
  preparing: 'Em preparo',
  picking: 'Em Separação',
  shipped: 'Despachado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  returned: 'Devolvido',
  refunded: 'Reembolsado',
  payment_failed: 'Falha no Pagamento',
  awaiting_payment: 'Aguardando Pagamento',
  under_review: 'Em Análise',
}

export function Status({ purchase }: { purchase: PurchaseType }) {
  const address = purchase.addresses

  return (
    <Card className="flex flex-col items-start gap-2 p-4">
      <Badge className="bg-emerald-500">{statuses[purchase.status]}</Badge>
      <strong>
        Chegou no dia {formatDate(purchase?.updated_at, `dd/MM 'às' HH:mm`)}
      </strong>

      <p className="text-muted-foreground">
        Seu pacote foi entregue às {formatDate(purchase.updated_at, 'HH:mm')} na{' '}
        {address?.street}, {address?.number}
        {address?.complement && `, ${address?.complement}`} -{' '}
        {address?.neighborhood} - {address?.city}/{address?.state}
      </p>
    </Card>
  )
}
