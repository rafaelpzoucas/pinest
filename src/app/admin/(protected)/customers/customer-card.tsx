import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

export function CustomerCard() {
  return (
    <Card className="p-4">
      <header className="flex flex-row gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1">
          <strong>{'order.customer_name'}</strong>
          <p className="text-xs text-muted-foreground">
            Telefone: +5518998261736
          </p>
          <p className="text-xs text-muted-foreground">
            Endereço: Rua Santa Cruz, 801
          </p>
        </div>

        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
      </header>
    </Card>
  )
}
